"""
AlgoVision AI — Agent 2: Execution Engine
Generates deterministic step-by-step execution states from code.
"""

from ..services.ai_provider import AIProvider, extract_json_from_response


SYSTEM_PROMPT = """You are an expert code execution engine for the AlgoVision AI platform.
Your job is to simulate the execution of code step-by-step and generate a deterministic trace.

For each step you must track:
- Which line of code is executing
- The current state of all variables
- Array/data structure transformations
- Pointer positions
- A clear description of what is happening at this step

You MUST generate realistic execution states as if you are running the code mentally.
The execution trace must be deterministic and accurate.

CRITICAL: Use a small, representative input for the execution trace. 
For sorting: use an array of 5-8 elements.
For searching: use an array of 6-10 elements.
For trees: use a tree with 5-8 nodes.
For graphs: use a graph with 5-8 nodes.
For DP: use small input that generates a manageable table.

You must respond ONLY with valid JSON. No markdown, no explanation outside the JSON.
"""

USER_PROMPT_TEMPLATE = """Generate a step-by-step execution trace for this {language} code.

ALGORITHM TYPE: {algorithm_type}
DATA STRUCTURES: {data_structures}

CODE:
```{language}
{code}
```

Generate a COMPLETE execution trace with a small representative input.

Respond with ONLY this JSON structure:
{{
  "input": "Description of the input used for this trace",
  "inputData": {{}},
  "steps": [
    {{
      "step": 1,
      "line": 3,
      "description": "Clear explanation of what happens at this step",
      "action": "initialize|compare|swap|assign|push|pop|visit|enqueue|dequeue|recurse|return|merge|split|update|highlight",
      "variables": {{"varName": "value"}},
      "array": [5, 3, 8, 1, 2],
      "highlights": [0, 1],
      "pointers": {{"i": 0, "j": 1}},
      "callStack": ["functionName(args)"],
      "nodes": [{{"id": "1", "value": 5, "x": 0, "y": 0}}],
      "edges": [{{"from": "1", "to": "2"}}],
      "activeNodes": ["1"],
      "activeEdges": [],
      "dpTable": [[0, 0], [0, 1]],
      "matrix": [[1, 2], [3, 4]]
    }}
  ]
}}

RULES:
- Include ONLY the fields relevant to this algorithm type
- For array algorithms: include array, highlights, pointers
- For tree/graph algorithms: include nodes, edges, activeNodes, activeEdges
- For DP algorithms: include dpTable
- For matrix algorithms: include matrix
- For recursion: include callStack
- Generate 10-30 steps that show the core algorithm execution
- Each step must have: step, line, description, action, variables
- Make highlights show which elements are being compared/swapped/processed
- Pointers should track index variables like i, j, left, right, etc.
"""


class ExecutionEngineAgent:
    """
    Agent 2 — Execution Engine
    Generates deterministic step-by-step execution states.
    """

    def __init__(self, ai_provider: AIProvider):
        self.ai = ai_provider

    async def generate_trace(
        self, language: str, code: str, analysis: dict
    ) -> dict:
        """
        Generate execution trace based on code and analysis.

        Args:
            language: Programming language
            code: Source code
            analysis: Output from CodeAnalyzerAgent

        Returns:
            dict with input, inputData, and steps array
        """
        prompt = USER_PROMPT_TEMPLATE.format(
            language=language,
            code=code,
            algorithm_type=analysis.get("algorithmType", "unknown"),
            data_structures=", ".join(analysis.get("dataStructures", [])),
        )

        response = await self.ai.generate(prompt, SYSTEM_PROMPT)
        result = extract_json_from_response(response)

        # Ensure steps exist and are properly numbered
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
        return result
