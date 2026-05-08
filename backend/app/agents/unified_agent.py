"""
AlgoVision AI — Unified Agent (Optimized)
Combines Code Analysis + Execution Trace into a SINGLE AI call.
Reduces 3 API calls to 1 for massive token and cost savings.
"""

import logging
from ..services.ai_provider import AIProvider, extract_json_from_response

logger = logging.getLogger("algovision.unified")

# ── Compact system prompt (minimized token usage) ──
SYSTEM_PROMPT = (
    "You analyze code and generate execution traces for DSA visualization. "
    "Respond with ONLY valid JSON. No markdown fences. No explanation outside JSON."
)

# ── Compact user prompt ──
USER_PROMPT_TEMPLATE = """Analyze this {language} code and generate a step-by-step execution trace.

```{language}
{code}
```

Return ONLY this JSON (no markdown):
{{
  "algorithm": "Name",
  "algorithmType": "sorting|searching|graph-traversal|dynamic-programming|tree|recursion|greedy|sliding-window|two-pointers|backtracking|hashing|stack|queue|linked-list|heap|trie|matrix|union-find|bit-manipulation|pathfinding",
  "dataStructures": ["array"],
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "explanation": "2-3 sentence educational explanation",
  "patterns": ["loop"],
  "input": "Input used for trace",
  "inputData": {{}},
  "steps": [
    {{
      "step": 1,
      "line": 1,
      "description": "What happens",
      "action": "initialize|compare|swap|assign|push|pop|visit|enqueue|dequeue|recurse|return|merge|split|update|highlight",
      "variables": {{}},
      "array": [],
      "highlights": [],
      "pointers": {{}}
    }}
  ]
}}

RULES:
- Use small input (5-8 elements for arrays, 5-8 nodes for trees/graphs)
- Generate 10-25 steps showing core execution
- Include ONLY fields relevant to the algorithm type:
  * Arrays/sorting/searching: array, highlights, pointers
  * Trees/graphs: add nodes, edges, activeNodes, activeEdges (omit array)
  * DP: add dpTable
  * Recursion: add callStack
  * Matrix: add matrix
- Every step MUST have: step, line, description, action, variables"""


class UnifiedAgent:
    """
    Single-call agent that combines code analysis + execution trace generation.
    Replaces the previous 3-agent pipeline (CodeAnalyzer + ExecutionEngine + VisualizationPlanner).
    """

    def __init__(self, ai_provider: AIProvider):
        self.ai = ai_provider

    async def analyze_and_trace(self, language: str, code: str) -> dict:
        """
        Single AI call that returns both analysis and execution trace.

        Returns:
            dict with algorithm, algorithmType, dataStructures,
            timeComplexity, spaceComplexity, explanation, patterns,
            input, inputData, and steps array
        """
        prompt = USER_PROMPT_TEMPLATE.format(language=language, code=code)

        logger.info("Sending unified analysis+trace request to AI")
        response = await self.ai.generate(prompt, SYSTEM_PROMPT)
        result = extract_json_from_response(response)

        # ── Ensure all required fields exist with defaults ──
        analysis_defaults = {
            "algorithm": "Unknown Algorithm",
            "algorithmType": "unknown",
            "dataStructures": [],
            "timeComplexity": "O(?)",
            "spaceComplexity": "O(?)",
            "explanation": "",
            "patterns": [],
            "input": "",
            "inputData": {},
        }
        for key, default in analysis_defaults.items():
            if key not in result:
                result[key] = default

        # ── Validate and fix steps ──
        steps = result.get("steps", [])
        for i, step in enumerate(steps):
            step["step"] = i + 1
            if "line" not in step:
                step["line"] = 1
            if "description" not in step:
                step["description"] = f"Step {i + 1}"
            if "action" not in step:
                step["action"] = "execute"
            if "variables" not in step:
                step["variables"] = {}

        result["steps"] = steps
        logger.info(f"Unified agent returned {len(steps)} execution steps")
        return result
