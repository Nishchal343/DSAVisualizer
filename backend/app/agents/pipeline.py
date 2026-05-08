"""
AlgoVision AI — Optimized Agent Pipeline
Uses a SINGLE unified AI call instead of 3 separate calls.
Visualization planning is deterministic (zero API cost).
Includes fallback support and caching.
"""

import time
import logging
from typing import Optional

from .unified_agent import UnifiedAgent
from .viz_resolver import resolve_visualization
from .fallback_engine import get_fallback_result
from ..services.ai_provider import get_ai_provider, RateLimitError
from ..cache import cache
from ..config import settings

logger = logging.getLogger("algovision.pipeline")


def _has_api_key() -> bool:
    """Check if a valid API key is configured for the selected provider."""
    provider = settings.AI_PROVIDER.lower()
    if provider == "openai":
        return bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your-openai-key-here")
    if provider == "gemini":
        return bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-gemini-key-here")
    if provider == "claude":
        return bool(settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_API_KEY != "your-anthropic-key-here")
    if provider == "ollama":
        return True  # No key needed for local models
    return False


class AgentPipeline:
    """
    Optimized pipeline orchestrator.

    BEFORE (3 AI calls per request):
        Code Analyzer → Execution Engine → Visualization Planner

    AFTER (1 AI call per request):
        Unified Agent (analysis + trace) → Deterministic Viz Resolver

    Cost reduction: ~66% fewer API calls, ~50% fewer tokens.
    """

    def __init__(self):
        self._has_key = _has_api_key()
        if self._has_key:
            self.provider = get_ai_provider()
            self.unified_agent = UnifiedAgent(self.provider)
        else:
            logger.warning("No AI API key configured — using fallback engine only")

    async def run(self, language: str, code: str) -> dict:
        """Execute the optimized pipeline with fallback support."""
        # ── Step 1: Check cache first ──
        cached = cache.get(language, code)
        if cached is not None:
            logger.info("Cache HIT — returning cached execution state")
            cached["fromCache"] = True
            return cached

        logger.info("Cache MISS — running optimized pipeline")
        start_time = time.time()

        # ── Step 2: Try fallback for known algorithms (zero API cost) ──
        fallback = get_fallback_result(language, code)

        if not self._has_key:
            if fallback:
                logger.info("Using fallback engine (no API key configured)")
                cache.set(language, code, fallback)
                return fallback
            else:
                raise ValueError(
                    "No AI API key configured and algorithm not recognized for fallback. "
                    "Please set your API key in backend/.env (GEMINI_API_KEY, OPENAI_API_KEY, etc.)"
                )

        # ── Step 3: Try AI pipeline (SINGLE call), fall back on error ──
        try:
            # ONE unified AI call (replaces 3 separate calls)
            logger.info("Running unified AI agent (single API call)...")
            ai_result = await self.unified_agent.analyze_and_trace(language, code)

            # Deterministic viz resolution (zero API cost)
            algorithm_type = ai_result.get("algorithmType", "unknown")
            viz_plan = resolve_visualization(algorithm_type)

            # Assemble final response
            code_lines = code.strip().split("\n")
            steps = ai_result.get("steps", [])

            result = {
                "algorithm": ai_result.get("algorithm", "Unknown"),
                "algorithmType": algorithm_type,
                "visualizationType": viz_plan.get("visualizationType", "2d-array"),
                "renderMode": viz_plan.get("renderMode", "2d"),
                "vizConfig": viz_plan,
                "timeComplexity": ai_result.get("timeComplexity", "O(?)"),
                "spaceComplexity": ai_result.get("spaceComplexity", "O(?)"),
                "explanation": ai_result.get("explanation", ""),
                "dataStructures": ai_result.get("dataStructures", []),
                "patterns": ai_result.get("patterns", []),
                "steps": steps,
                "totalSteps": len(steps),
                "codeLines": code_lines,
                "input": ai_result.get("input", ""),
                "inputData": ai_result.get("inputData", {}),
                "fromCache": False,
                "processingTime": round(time.time() - start_time, 2),
            }

            cache.set(language, code, result)
            logger.info(
                f"Pipeline complete in {result['processingTime']}s — "
                f"{len(steps)} steps generated (1 API call)"
            )
            return result

        except RateLimitError as e:
            logger.warning(f"Rate limit hit: {e}")
            if fallback:
                logger.info("Falling back to pre-built execution state (rate limited)")
                fallback["rateLimited"] = True
                cache.set(language, code, fallback)
                return fallback
            # Re-raise as RateLimitError so the route handler can return 429
            raise

        except Exception as e:
            logger.error(f"AI pipeline failed: {e}")
            if fallback:
                logger.info("Falling back to pre-built execution state")
                cache.set(language, code, fallback)
                return fallback
            raise


# ── Singleton pipeline instance ──
_pipeline_instance: Optional[AgentPipeline] = None


def get_pipeline() -> AgentPipeline:
    """Get or create the singleton pipeline instance."""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = AgentPipeline()
    return _pipeline_instance
