"""
AlgoVision AI — Agent 3: Visualization Strategy Planner
Decides the best visualization approach based on algorithm analysis.
"""

from ..services.ai_provider import AIProvider, extract_json_from_response


SYSTEM_PROMPT = """You are an expert visualization strategist for the AlgoVision AI platform.
Your job is to decide the optimal visualization strategy for an algorithm.

You must choose between:
- 2D visualization (for arrays, sorting, DP tables, matrices, sliding window, two pointers, hash maps, prefix sums)
- 3D visualization (for trees, graphs, recursion stacks, heaps, pathfinding, BFS/DFS traversal)

The visualization must be educationally effective, not decorative.

You must respond ONLY with valid JSON. No markdown, no explanation outside the JSON.
"""

USER_PROMPT_TEMPLATE = """Decide the best visualization strategy for this algorithm.

ALGORITHM: {algorithm}
TYPE: {algorithm_type}
DATA STRUCTURES: {data_structures}
PATTERNS: {patterns}

Respond with ONLY this JSON structure:
{{
  "visualizationType": "2d-array|2d-bars|2d-grid|2d-table|2d-linkedlist|2d-pointers|3d-tree|3d-graph|3d-stack|3d-heap",
  "renderMode": "2d|3d",
  "layout": "horizontal|vertical|grid|radial|hierarchical|force-directed",
  "animationStyle": "swap|slide|fade|grow|pulse|highlight|traverse|fill",
  "colorScheme": "comparison|gradient|categorical|heatmap|status",
  "elementShape": "bar|circle|rectangle|node|card",
  "showPointers": true,
  "showCallStack": false,
  "showDPTable": false,
  "showMatrix": false,
  "reasoning": "Brief explanation of why this visualization approach was chosen"
}}

GUIDELINES:
- Use 2d-bars for sorting algorithms (visual bar comparisons)
- Use 2d-array for array manipulation (sliding window, two pointers)
- Use 2d-grid for matrix/DP table algorithms
- Use 2d-table for hash map operations
- Use 2d-linkedlist for linked list problems
- Use 2d-pointers for two-pointer techniques
- Use 3d-tree for binary trees, BST, trie
- Use 3d-graph for graph algorithms (BFS, DFS, shortest path)
- Use 3d-stack for recursion visualization
- Use 3d-heap for heap/priority queue
- showCallStack=true for recursive algorithms
- showDPTable=true for dynamic programming
- showMatrix=true for matrix traversal algorithms
"""


class VisualizationPlannerAgent:
    """
    Agent 3 — Visualization Strategy
    Intelligently selects the best visualization approach based on algorithm type.
    """

    def __init__(self, ai_provider: AIProvider):
        self.ai = ai_provider

    async def plan(self, analysis: dict) -> dict:
        """
        Determine the optimal visualization strategy.

        Args:
            analysis: Output from CodeAnalyzerAgent

        Returns:
            dict with visualizationType, renderMode, layout, etc.
        """
        prompt = USER_PROMPT_TEMPLATE.format(
            algorithm=analysis.get("algorithm", "Unknown"),
            algorithm_type=analysis.get("algorithmType", "unknown"),
            data_structures=", ".join(analysis.get("dataStructures", [])),
            patterns=", ".join(analysis.get("patterns", [])),
        )

        response = await self.ai.generate(prompt, SYSTEM_PROMPT)
        result = extract_json_from_response(response)

        # Ensure required fields with sensible defaults
        defaults = {
            "visualizationType": "2d-array",
            "renderMode": "2d",
            "layout": "horizontal",
            "animationStyle": "highlight",
            "colorScheme": "comparison",
            "elementShape": "bar",
            "showPointers": False,
            "showCallStack": False,
            "showDPTable": False,
            "showMatrix": False,
            "reasoning": "",
        }
        for key, default in defaults.items():
            if key not in result:
                result[key] = default

        return result
