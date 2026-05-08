"""
AlgoVision AI — Agent 1: Code Analyzer
Identifies algorithm type, data structures, complexity, and provides intuition.
"""

from ..services.ai_provider import AIProvider, extract_json_from_response


SYSTEM_PROMPT = """You are an expert algorithm analyst for the AlgoVision AI platform.
Your job is to analyze code and identify:
1. The algorithm name and type
2. Data structures used
3. Time complexity (Big-O)
4. Space complexity (Big-O)
5. A clear, educational explanation of how the algorithm works
6. Key patterns detected (loops, recursion, divide-and-conquer, etc.)

You must respond ONLY with valid JSON. No markdown, no explanation outside the JSON.
"""

USER_PROMPT_TEMPLATE = """Analyze the following {language} code and provide a structured analysis.

CODE:
```{language}
{code}
```

Respond with ONLY this JSON structure (no markdown code blocks):
{{
  "algorithm": "Name of the algorithm (e.g., Bubble Sort, Binary Search, BFS)",
  "algorithmType": "Category (e.g., sorting, searching, graph-traversal, dynamic-programming, tree, recursion, greedy, sliding-window, two-pointers, backtracking, hashing, stack, queue, linked-list, heap, trie, matrix, union-find, bit-manipulation, pathfinding)",
  "dataStructures": ["array", "hashmap", ...],
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "explanation": "A clear 3-5 sentence explanation of how this algorithm works, written for a student learning DSA.",
  "patterns": ["loop", "nested-loop", "recursion", "memoization", ...],
  "inputDescription": "Description of what the input represents",
  "outputDescription": "Description of what the output represents"
}}
"""


class CodeAnalyzerAgent:
    """
    Agent 1 — Code Analyzer
    Analyzes submitted code to identify algorithm type, data structures,
    complexity, and provide educational explanation.
    """

    def __init__(self, ai_provider: AIProvider):
        self.ai = ai_provider

    async def analyze(self, language: str, code: str) -> dict:
        """
        Analyze code and return structured analysis.

        Args:
            language: Programming language of the code
            code: The source code to analyze

        Returns:
            dict with algorithm, algorithmType, dataStructures,
            timeComplexity, spaceComplexity, explanation, patterns
        """
        prompt = USER_PROMPT_TEMPLATE.format(language=language, code=code)
        response = await self.ai.generate(prompt, SYSTEM_PROMPT)
        result = extract_json_from_response(response)

        # Ensure required fields exist with defaults
        defaults = {
            "algorithm": "Unknown Algorithm",
            "algorithmType": "unknown",
            "dataStructures": [],
            "timeComplexity": "O(?)",
            "spaceComplexity": "O(?)",
            "explanation": "",
            "patterns": [],
            "inputDescription": "",
            "outputDescription": "",
        }
        for key, default in defaults.items():
            if key not in result:
                result[key] = default

        return result
