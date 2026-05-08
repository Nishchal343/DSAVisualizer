"""
AlgoVision AI — API Routes (Optimized)
Defines all FastAPI endpoints with rate-limit-aware error handling.
"""

import logging
from fastapi import APIRouter, HTTPException
from ..models.schemas import AnalyzeRequest, HealthResponse
from ..agents.pipeline import get_pipeline
from ..services.ai_provider import RateLimitError
from ..services.rate_limiter import throttler
from ..cache import cache

logger = logging.getLogger("algovision.routes")

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse()


@router.post("/analyze")
async def analyze_code(request: AnalyzeRequest):
    """
    Main endpoint — analyze code and generate execution states.

    Runs the optimized single-call pipeline:
    Unified Agent (1 AI call) → Deterministic Viz Resolver

    Returns structured execution-state JSON for frontend rendering.
    All playback happens locally on the frontend — NO additional AI calls.
    """
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    if len(request.code) > 50000:
        raise HTTPException(status_code=400, detail="Code too long (max 50,000 chars)")

    try:
        # Use singleton pipeline (avoids recreating per request)
        pipeline = get_pipeline()
        result = await pipeline.run(request.language, request.code)
        return result

    except RateLimitError as e:
        logger.warning(f"429 Rate limit: {e}")
        raise HTTPException(
            status_code=429,
            detail="Rate limit reached. Please wait 30-60 seconds and try again.",
            headers={"Retry-After": "30"},
        )

    except ValueError as e:
        logger.error(f"AI parsing error: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse AI response. Please try again. Error: {str(e)}"
        )

    except Exception as e:
        error_msg = str(e).lower()
        # Catch any uncaught 429-like errors
        if "429" in error_msg or "rate" in error_msg or "quota" in error_msg:
            raise HTTPException(
                status_code=429,
                detail="Rate limit reached. Please wait 30-60 seconds and try again.",
                headers={"Retry-After": "30"},
            )

        logger.error(f"Pipeline error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/run")
async def run_code(request: AnalyzeRequest):
    """
    Execute code and return stdout/stderr.
    Supports Python, Java, JavaScript (Node), C, C++.
    """
    import subprocess
    import tempfile
    import os
    import shutil
    import re

    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    lang = request.language.lower()
    timeout_sec = 10

    def _run_cmd(cmd, cwd=None):
        """Run a command and return result dict."""
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True,
                timeout=timeout_sec, cwd=cwd,
            )
            return {
                "stdout": result.stdout[:5000],
                "stderr": result.stderr[:5000],
                "returnCode": result.returncode,
                "error": result.returncode != 0,
            }
        except subprocess.TimeoutExpired:
            return {"stdout": "", "stderr": "⏱ Execution timed out (10s limit)", "returnCode": 1, "error": True}
        except FileNotFoundError as e:
            return {"stdout": "", "stderr": f"Compiler/runtime not found: {e}", "returnCode": 1, "error": True}

    tmp_dir = tempfile.mkdtemp()

    try:
        # ── Python ──
        if lang in ("python", "python3"):
            fpath = os.path.join(tmp_dir, "main.py")
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(request.code)
            return _run_cmd(["python", fpath], cwd=tmp_dir)

        # ── JavaScript (Node.js) ──
        elif lang in ("javascript", "js"):
            fpath = os.path.join(tmp_dir, "main.js")
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(request.code)
            return _run_cmd(["node", fpath], cwd=tmp_dir)

        # ── Java ──
        elif lang == "java":
            # Extract public class name from code
            match = re.search(r"(?:public\s+)?class\s+(\w+)", request.code)
            class_name = match.group(1) if match else "Main"
            fpath = os.path.join(tmp_dir, f"{class_name}.java")
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(request.code)

            # Compile
            comp = _run_cmd(["javac", fpath], cwd=tmp_dir)
            if comp["error"]:
                comp["stderr"] = "Compilation Error:\n" + comp["stderr"]
                return comp

            # Run
            return _run_cmd(["java", "-cp", tmp_dir, class_name], cwd=tmp_dir)

        # ── C++ ──
        elif lang in ("cpp", "c++"):
            fpath = os.path.join(tmp_dir, "main.cpp")
            out_path = os.path.join(tmp_dir, "main.exe")
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(request.code)

            comp = _run_cmd(["g++", "-o", out_path, fpath], cwd=tmp_dir)
            if comp["error"]:
                comp["stderr"] = "Compilation Error:\n" + comp["stderr"]
                return comp

            return _run_cmd([out_path], cwd=tmp_dir)

        # ── C ──
        elif lang == "c":
            fpath = os.path.join(tmp_dir, "main.c")
            out_path = os.path.join(tmp_dir, "main.exe")
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(request.code)

            comp = _run_cmd(["gcc", "-o", out_path, fpath], cwd=tmp_dir)
            if comp["error"]:
                comp["stderr"] = "Compilation Error:\n" + comp["stderr"]
                return comp

            return _run_cmd([out_path], cwd=tmp_dir)

        else:
            return {
                "stdout": "",
                "stderr": f"Language '{lang}' is not supported for execution. Supported: Python, Java, JavaScript, C, C++",
                "returnCode": 1,
                "error": True,
            }

    except Exception as e:
        return {"stdout": "", "stderr": str(e), "returnCode": 1, "error": True}

    finally:
        # Cleanup temp directory
        try:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        except Exception:
            pass


@router.get("/cache/stats")
async def cache_stats():
    """Return cache and throttler statistics."""
    return {
        "cache": cache.stats(),
        "throttler": throttler.stats(),
    }


@router.post("/cache/clear")
async def clear_cache():
    """Clear the execution state cache."""
    cache.clear()
    return {"status": "cleared"}
