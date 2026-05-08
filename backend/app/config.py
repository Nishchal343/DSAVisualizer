"""
AlgoVision AI — Configuration Module
Loads environment variables and provides app-wide settings.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from the backend root directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_env_path)
print(f"[CONFIG] Loaded .env from: {_env_path} (exists={_env_path.exists()})")
print(f"[CONFIG] GEMINI_API_KEY loaded: {'yes (' + os.getenv('GEMINI_API_KEY', '')[:10] + '...)' if os.getenv('GEMINI_API_KEY') else 'NO'}")


class Settings:
    """Application settings loaded from environment."""

    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    CACHE_MAX_SIZE: int = int(os.getenv("CACHE_MAX_SIZE", "500"))
    CACHE_TTL_SECONDS: int = int(os.getenv("CACHE_TTL_SECONDS", "3600"))


settings = Settings()
