"""
AlgoVision AI — Cache System (Enhanced)
Hash-based LRU caching with TTL for execution states to minimize AI API calls.
"""

import hashlib
import json
import time
from collections import OrderedDict
from typing import Optional

from ..config import settings


class ExecutionCache:
    """
    LRU cache with TTL for AI-generated execution states.
    Uses code hash as the key to avoid regenerating identical analyses.
    """

    def __init__(self, max_size: int = None, ttl_seconds: int = None):
        self.max_size = max_size or settings.CACHE_MAX_SIZE
        self.ttl = ttl_seconds or getattr(settings, "CACHE_TTL_SECONDS", 3600)
        self._cache: OrderedDict[str, dict] = OrderedDict()
        self._hits = 0
        self._misses = 0

    @staticmethod
    def _hash_code(language: str, code: str) -> str:
        """Generate a deterministic hash for a code submission."""
        normalized = code.strip().replace("\r\n", "\n")
        # Remove extra whitespace variations to improve cache hit rate
        normalized = "\n".join(line.rstrip() for line in normalized.split("\n"))
        content = f"{language.lower()}::{normalized}"
        return hashlib.sha256(content.encode()).hexdigest()

    def get(self, language: str, code: str) -> Optional[dict]:
        """Retrieve cached execution state if available and not expired."""
        if not settings.CACHE_ENABLED:
            return None

        key = self._hash_code(language, code)
        if key in self._cache:
            entry = self._cache[key]

            # Check TTL expiration
            age = time.time() - entry["cache_created"]
            if age > self.ttl:
                # Expired — remove and treat as miss
                del self._cache[key]
                self._misses += 1
                return None

            self._hits += 1
            self._cache.move_to_end(key)
            entry["cache_accessed"] = time.time()
            # Return a copy to prevent mutation
            return {**entry["data"]}

        self._misses += 1
        return None

    def set(self, language: str, code: str, data: dict) -> None:
        """Store execution state in cache."""
        if not settings.CACHE_ENABLED:
            return

        key = self._hash_code(language, code)

        if key in self._cache:
            self._cache.move_to_end(key)
            self._cache[key] = {
                "data": data,
                "cache_created": time.time(),
                "cache_accessed": time.time(),
            }
        else:
            if len(self._cache) >= self.max_size:
                self._cache.popitem(last=False)
            self._cache[key] = {
                "data": data,
                "cache_created": time.time(),
                "cache_accessed": time.time(),
            }

    def has(self, language: str, code: str) -> bool:
        """Check if a code submission is cached (without counting as hit/miss)."""
        if not settings.CACHE_ENABLED:
            return False
        key = self._hash_code(language, code)
        if key in self._cache:
            age = time.time() - self._cache[key]["cache_created"]
            return age <= self.ttl
        return False

    def stats(self) -> dict:
        """Return cache statistics."""
        total = self._hits + self._misses
        return {
            "size": len(self._cache),
            "max_size": self.max_size,
            "ttl_seconds": self.ttl,
            "hits": self._hits,
            "misses": self._misses,
            "hit_rate": round(self._hits / total, 3) if total > 0 else 0,
        }

    def clear(self) -> None:
        """Clear all cached entries."""
        self._cache.clear()
        self._hits = 0
        self._misses = 0


# Singleton instance
cache = ExecutionCache()
