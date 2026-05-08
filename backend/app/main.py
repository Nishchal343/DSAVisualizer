"""
AlgoVision AI — FastAPI Application Entry Point
Main server with CORS, logging, and route registration.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.analyze import router
from .config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-25s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("algovision")

# Create FastAPI app
app = FastAPI(
    title="AlgoVision AI",
    description="AI-powered DSA & LeetCode visualization engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup():
    logger.info("=" * 60)
    logger.info("  AlgoVision AI — Backend Starting")
    logger.info(f"  AI Provider: {settings.AI_PROVIDER}")
    logger.info(f"  Cache: {'enabled' if settings.CACHE_ENABLED else 'disabled'}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown():
    logger.info("AlgoVision AI — Backend shutting down")
