"""
AlgoVision AI — AI Provider Abstraction (Optimized)
Supports OpenAI, Gemini, Claude, and Ollama with a unified interface.
Includes robust retry logic with exponential backoff + jitter for rate limits.
"""

import json
import re
import random
import asyncio
import logging
import httpx
from abc import ABC, abstractmethod
from typing import Optional

from ..config import settings
from .rate_limiter import throttler

logger = logging.getLogger("algovision.ai")


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        """Send a prompt and return the response text."""
        pass


class RateLimitError(Exception):
    """Raised when all retries for rate limiting are exhausted."""

    def __init__(self, message="Rate limit exceeded after all retries"):
        self.message = message
        super().__init__(self.message)


class OpenAIProvider(AIProvider):
    """OpenAI GPT provider."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = "https://api.openai.com/v1/chat/completions"
        self.model = "gpt-4o-mini"  # Use cheaper model by default

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with throttler:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.15,
                        "max_tokens": 4096,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]


class GeminiProvider(AIProvider):
    """Google Gemini provider with robust retry logic for rate limits."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = "gemini-2.0-flash"  # Fast, low-cost model
        self.base_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.model}:generateContent"
        )

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
        max_retries = 6

        async with throttler:
            async with httpx.AsyncClient(timeout=120.0) as client:
                for attempt in range(max_retries):
                    try:
                        response = await client.post(
                            f"{self.base_url}?key={self.api_key}",
                            headers={"Content-Type": "application/json"},
                            json={
                                "contents": [{"parts": [{"text": full_prompt}]}],
                                "generationConfig": {
                                    "temperature": 0.15,
                                    "maxOutputTokens": 4096,
                                },
                            },
                        )

                        if response.status_code == 429:
                            # Exponential backoff with jitter
                            base_wait = min(2 ** attempt, 32)
                            jitter = random.uniform(0.5, 1.5)
                            wait = base_wait * jitter
                            logger.warning(
                                f"Rate limited (429). Retry {attempt + 1}/{max_retries} "
                                f"in {wait:.1f}s..."
                            )
                            if attempt < max_retries - 1:
                                await asyncio.sleep(wait)
                                continue
                            else:
                                raise RateLimitError(
                                    "Gemini API rate limit exceeded. Please wait 30-60 seconds and try again."
                                )

                        if response.status_code == 503:
                            # Service temporarily unavailable
                            wait = 3 * (attempt + 1)
                            logger.warning(
                                f"Service unavailable (503). Retry {attempt + 1}/{max_retries} "
                                f"in {wait}s..."
                            )
                            if attempt < max_retries - 1:
                                await asyncio.sleep(wait)
                                continue

                        response.raise_for_status()
                        data = response.json()

                        # Validate response structure
                        candidates = data.get("candidates", [])
                        if not candidates:
                            logger.warning("Empty candidates in Gemini response")
                            if attempt < max_retries - 1:
                                await asyncio.sleep(2)
                                continue
                            raise ValueError("Gemini returned empty response")

                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if not text.strip():
                            logger.warning("Empty text in Gemini response")
                            if attempt < max_retries - 1:
                                await asyncio.sleep(2)
                                continue
                            raise ValueError("Gemini returned empty text")

                        return text

                    except httpx.TimeoutException:
                        logger.warning(
                            f"Request timeout. Retry {attempt + 1}/{max_retries}..."
                        )
                        if attempt < max_retries - 1:
                            await asyncio.sleep(3 * (attempt + 1))
                            continue
                        raise

                    except (httpx.ConnectError, httpx.ReadError) as e:
                        logger.warning(
                            f"Connection error: {e}. Retry {attempt + 1}/{max_retries}..."
                        )
                        if attempt < max_retries - 1:
                            await asyncio.sleep(2 * (attempt + 1))
                            continue
                        raise

        # Should never reach here, but just in case
        raise RateLimitError("All retries exhausted")


class ClaudeProvider(AIProvider):
    """Anthropic Claude provider."""

    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-sonnet-4-20250514"

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        async with throttler:
            async with httpx.AsyncClient(timeout=120.0) as client:
                body = {
                    "model": self.model,
                    "max_tokens": 4096,
                    "temperature": 0.15,
                    "messages": [{"role": "user", "content": prompt}],
                }
                if system_prompt:
                    body["system"] = system_prompt

                response = await client.post(
                    self.base_url,
                    headers={
                        "x-api-key": self.api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json",
                    },
                    json=body,
                )
                response.raise_for_status()
                data = response.json()
                return data["content"][0]["text"]


class OllamaProvider(AIProvider):
    """Ollama local model provider."""

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL

    async def generate(self, prompt: str, system_prompt: str = "") -> str:
        async with httpx.AsyncClient(timeout=300.0) as client:
            body = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
            }
            if system_prompt:
                body["system"] = system_prompt

            response = await client.post(
                f"{self.base_url}/api/generate",
                json=body,
            )
            response.raise_for_status()
            data = response.json()
            return data["response"]


def get_ai_provider() -> AIProvider:
    """Factory function to get the configured AI provider."""
    providers = {
        "openai": OpenAIProvider,
        "gemini": GeminiProvider,
        "claude": ClaudeProvider,
        "ollama": OllamaProvider,
    }

    provider_name = settings.AI_PROVIDER.lower()
    if provider_name not in providers:
        raise ValueError(
            f"Unknown AI provider: {provider_name}. "
            f"Supported: {', '.join(providers.keys())}"
        )

    return providers[provider_name]()


def extract_json_from_response(text: str) -> dict:
    """
    Extract JSON from an AI response that may contain markdown code blocks
    or other surrounding text.
    """
    # Try to find JSON in code blocks first
    patterns = [
        r"```json\s*([\s\S]*?)\s*```",
        r"```\s*([\s\S]*?)\s*```",
        r"\{[\s\S]*\}",
    ]

    for pattern in patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            try:
                return json.loads(match)
            except json.JSONDecodeError:
                continue

    # Last resort: try parsing the entire text
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise ValueError(f"Could not extract valid JSON from AI response: {text[:500]}")
