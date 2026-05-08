"""
AlgoVision AI — Pydantic Models
Request/response schemas for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional


class AnalyzeRequest(BaseModel):
    """Request body for the /analyze endpoint."""
    language: str = Field(default="python", description="Programming language of the code")
    code: str = Field(..., description="The code to analyze and visualize")


class VariableState(BaseModel):
    """State of variables at a given execution step."""
    class Config:
        extra = "allow"


class ExecutionStep(BaseModel):
    """A single step in the execution trace."""
    step: int
    line: int
    description: str = ""
    variables: dict = {}
    array: Optional[list] = None
    highlights: list = []
    pointers: dict = {}
    action: str = ""
    callStack: Optional[list] = None
    nodes: Optional[list] = None
    edges: Optional[list] = None
    activeNodes: Optional[list] = None
    activeEdges: Optional[list] = None
    dpTable: Optional[list] = None
    matrix: Optional[list] = None


class AnalyzeResponse(BaseModel):
    """Response from the /analyze endpoint."""
    algorithm: str
    algorithmType: str = ""
    visualizationType: str
    timeComplexity: str
    spaceComplexity: str
    explanation: str = ""
    steps: list[ExecutionStep]
    totalSteps: int = 0
    dataStructures: list[str] = []
    codeLines: list[str] = []


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"
    service: str = "AlgoVision AI"
    version: str = "1.0.0"
