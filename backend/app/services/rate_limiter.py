"""
AlgoVision AI — Rate Limiter & Request Throttler
Prevents excessive concurrent Gemini API calls using an asyncio semaphore.
"""

import asyncio
import logging
import time
from typing import Optional

logger = logging.getLogger("algovision.ratelimit")


class RequestThrottler:
    """
    Limits concurrent AI API calls and enforces minimum intervals between requests.
    Prevents 429 rate limit errors by controlling request flow.
    """

    def __init__(self, max_concurrent: int = 2, min_interval_ms: int = 500):
        """
        Args:
            max_concurrent: Maximum number of concurrent AI API calls
            min_interval_ms: Minimum milliseconds between requests
        """
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._min_interval = min_interval_ms / 1000.0  # Convert to seconds
        self._last_request_time: float = 0.0
        self._lock = asyncio.Lock()
        self._total_requests = 0
        self._throttled_requests = 0

    async def acquire(self):
        """Acquire a slot to make an API call. Blocks if at capacity."""
        await self._semaphore.acquire()

        # Enforce minimum interval between requests
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self._last_request_time
            if elapsed < self._min_interval:
                wait_time = self._min_interval - elapsed
                self._throttled_requests += 1
                logger.debug(f"Throttling request — waiting {wait_time:.2f}s")
                await asyncio.sleep(wait_time)
            self._last_request_time = time.monotonic()
            self._total_requests += 1

    def release(self):
        """Release the API call slot."""
        self._semaphore.release()

    async def __aenter__(self):
        await self.acquire()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.release()
        return False

    def stats(self) -> dict:
        """Return throttler statistics."""
        return {
            "total_requests": self._total_requests,
            "throttled_requests": self._throttled_requests,
            "available_slots": self._semaphore._value,
        }


# ── Singleton instance ──
throttler = RequestThrottler(max_concurrent=2, min_interval_ms=600)
