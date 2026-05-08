"""
AlgoVision AI — Fallback Execution Engine
Provides pre-built execution states for common algorithms when no AI API key is configured.
"""

import re


def detect_algorithm(code: str) -> str:
    code_lower = code.lower()
    patterns = {
        "bubble_sort": ["bubble", "swap", "arr[j] > arr[j+1]", "arr[j] > arr[j + 1]"],
        "selection_sort": ["selection", "min_idx", "min_index"],
        "insertion_sort": ["insertion", "key = arr", "key =arr"],
        "merge_sort": ["merge_sort", "merge(", "mid = "],
        "quick_sort": ["quick_sort", "pivot", "partition"],
        "binary_search": ["binary_search", "low", "high", "mid"],
        "two_sum": ["two_sum", "target - ", "complement"],
        "bfs": ["bfs", "queue", "deque", "breadth"],
        "dfs": ["dfs", "depth", "stack"],
        "fibonacci": ["fibonacci", "fib(", "fib ("],
        "linked_list": ["listnode", "next", "head"],
        "sliding_window": ["window", "max_sum", "maxsum"],
    }
    for algo, keywords in patterns.items():
        if any(k in code_lower for k in keywords):
            return algo
    return "generic"


BUBBLE_SORT_RESULT = {
    "algorithm": "Bubble Sort",
    "algorithmType": "sorting",
    "visualizationType": "2d-bars",
    "renderMode": "2d",
    "vizConfig": {"visualizationType": "2d-bars", "renderMode": "2d", "layout": "horizontal",
                  "animationStyle": "swap", "colorScheme": "comparison", "elementShape": "bar",
                  "showPointers": True, "showCallStack": False, "showDPTable": False, "showMatrix": False},
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(1)",
    "explanation": "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. This process is repeated until the list is sorted. It's called 'bubble' sort because smaller elements 'bubble' to the top of the list.",
    "dataStructures": ["array"],
    "patterns": ["nested-loop", "comparison", "swap"],
    "input": "arr = [64, 34, 25, 12, 22, 11, 90]",
    "inputData": {"arr": [64, 34, 25, 12, 22, 11, 90]},
    "fromCache": False,
    "steps": [
        {"step": 1, "line": 2, "description": "Initialize n = 7 (length of array)", "action": "initialize", "variables": {"n": 7, "arr": [64, 34, 25, 12, 22, 11, 90]}, "array": [64, 34, 25, 12, 22, 11, 90], "highlights": [], "pointers": {}},
        {"step": 2, "line": 3, "description": "Start outer loop: i = 0", "action": "initialize", "variables": {"n": 7, "i": 0}, "array": [64, 34, 25, 12, 22, 11, 90], "highlights": [], "pointers": {"i": 0}},
        {"step": 3, "line": 4, "description": "Inner loop: j = 0. Compare arr[0]=64 and arr[1]=34", "action": "compare", "variables": {"n": 7, "i": 0, "j": 0}, "array": [64, 34, 25, 12, 22, 11, 90], "highlights": [0, 1], "pointers": {"i": 0, "j": 0}},
        {"step": 4, "line": 6, "description": "64 > 34 → Swap arr[0] and arr[1]", "action": "swap", "variables": {"n": 7, "i": 0, "j": 0}, "array": [34, 64, 25, 12, 22, 11, 90], "highlights": [0, 1], "pointers": {"i": 0, "j": 0}},
        {"step": 5, "line": 4, "description": "j = 1. Compare arr[1]=64 and arr[2]=25", "action": "compare", "variables": {"n": 7, "i": 0, "j": 1}, "array": [34, 64, 25, 12, 22, 11, 90], "highlights": [1, 2], "pointers": {"i": 0, "j": 1}},
        {"step": 6, "line": 6, "description": "64 > 25 → Swap arr[1] and arr[2]", "action": "swap", "variables": {"n": 7, "i": 0, "j": 1}, "array": [34, 25, 64, 12, 22, 11, 90], "highlights": [1, 2], "pointers": {"i": 0, "j": 1}},
        {"step": 7, "line": 4, "description": "j = 2. Compare arr[2]=64 and arr[3]=12", "action": "compare", "variables": {"n": 7, "i": 0, "j": 2}, "array": [34, 25, 64, 12, 22, 11, 90], "highlights": [2, 3], "pointers": {"i": 0, "j": 2}},
        {"step": 8, "line": 6, "description": "64 > 12 → Swap arr[2] and arr[3]", "action": "swap", "variables": {"n": 7, "i": 0, "j": 2}, "array": [34, 25, 12, 64, 22, 11, 90], "highlights": [2, 3], "pointers": {"i": 0, "j": 2}},
        {"step": 9, "line": 4, "description": "j = 3. Compare arr[3]=64 and arr[4]=22", "action": "compare", "variables": {"n": 7, "i": 0, "j": 3}, "array": [34, 25, 12, 64, 22, 11, 90], "highlights": [3, 4], "pointers": {"i": 0, "j": 3}},
        {"step": 10, "line": 6, "description": "64 > 22 → Swap arr[3] and arr[4]", "action": "swap", "variables": {"n": 7, "i": 0, "j": 3}, "array": [34, 25, 12, 22, 64, 11, 90], "highlights": [3, 4], "pointers": {"i": 0, "j": 3}},
        {"step": 11, "line": 4, "description": "j = 4. Compare arr[4]=64 and arr[5]=11", "action": "compare", "variables": {"n": 7, "i": 0, "j": 4}, "array": [34, 25, 12, 22, 64, 11, 90], "highlights": [4, 5], "pointers": {"i": 0, "j": 4}},
        {"step": 12, "line": 6, "description": "64 > 11 → Swap arr[4] and arr[5]", "action": "swap", "variables": {"n": 7, "i": 0, "j": 4}, "array": [34, 25, 12, 22, 11, 64, 90], "highlights": [4, 5], "pointers": {"i": 0, "j": 4}},
        {"step": 13, "line": 4, "description": "j = 5. Compare arr[5]=64 and arr[6]=90", "action": "compare", "variables": {"n": 7, "i": 0, "j": 5}, "array": [34, 25, 12, 22, 11, 64, 90], "highlights": [5, 6], "pointers": {"i": 0, "j": 5}},
        {"step": 14, "line": 5, "description": "64 < 90 → No swap needed. 90 is now in correct position.", "action": "compare", "variables": {"n": 7, "i": 0, "j": 5}, "array": [34, 25, 12, 22, 11, 64, 90], "highlights": [6], "pointers": {"i": 0, "j": 5}},
        {"step": 15, "line": 3, "description": "Start outer loop: i = 1. Begin second pass.", "action": "initialize", "variables": {"n": 7, "i": 1}, "array": [34, 25, 12, 22, 11, 64, 90], "highlights": [], "pointers": {"i": 1}},
        {"step": 16, "line": 4, "description": "j = 0. Compare arr[0]=34 and arr[1]=25", "action": "compare", "variables": {"n": 7, "i": 1, "j": 0}, "array": [34, 25, 12, 22, 11, 64, 90], "highlights": [0, 1], "pointers": {"i": 1, "j": 0}},
        {"step": 17, "line": 6, "description": "34 > 25 → Swap arr[0] and arr[1]", "action": "swap", "variables": {"n": 7, "i": 1, "j": 0}, "array": [25, 34, 12, 22, 11, 64, 90], "highlights": [0, 1], "pointers": {"i": 1, "j": 0}},
        {"step": 18, "line": 6, "description": "34 > 12 → Swap arr[1] and arr[2]", "action": "swap", "variables": {"n": 7, "i": 1, "j": 1}, "array": [25, 12, 34, 22, 11, 64, 90], "highlights": [1, 2], "pointers": {"i": 1, "j": 1}},
        {"step": 19, "line": 6, "description": "34 > 22 → Swap arr[2] and arr[3]", "action": "swap", "variables": {"n": 7, "i": 1, "j": 2}, "array": [25, 12, 22, 34, 11, 64, 90], "highlights": [2, 3], "pointers": {"i": 1, "j": 2}},
        {"step": 20, "line": 6, "description": "34 > 11 → Swap arr[3] and arr[4]", "action": "swap", "variables": {"n": 7, "i": 1, "j": 3}, "array": [25, 12, 22, 11, 34, 64, 90], "highlights": [3, 4], "pointers": {"i": 1, "j": 3}},
        {"step": 21, "line": 7, "description": "Array after pass 2: [25, 12, 22, 11, 34, 64, 90]. Sorting continues...", "action": "highlight", "variables": {"n": 7, "i": 1}, "array": [25, 12, 22, 11, 34, 64, 90], "highlights": [4, 5, 6], "pointers": {}},
        {"step": 22, "line": 7, "description": "...several passes later, array is now sorted: [11, 12, 22, 25, 34, 64, 90]", "action": "sorted", "variables": {"n": 7}, "array": [11, 12, 22, 25, 34, 64, 90], "highlights": [0, 1, 2, 3, 4, 5, 6], "pointers": {}},
        {"step": 23, "line": 8, "description": "Return sorted array [11, 12, 22, 25, 34, 64, 90]", "action": "return", "variables": {"result": [11, 12, 22, 25, 34, 64, 90]}, "array": [11, 12, 22, 25, 34, 64, 90], "highlights": [0, 1, 2, 3, 4, 5, 6], "pointers": {}},
    ],
}

BINARY_SEARCH_RESULT = {
    "algorithm": "Binary Search",
    "algorithmType": "searching",
    "visualizationType": "2d-array",
    "renderMode": "2d",
    "vizConfig": {"visualizationType": "2d-array", "renderMode": "2d", "layout": "horizontal",
                  "animationStyle": "highlight", "colorScheme": "comparison", "elementShape": "bar",
                  "showPointers": True, "showCallStack": False, "showDPTable": False, "showMatrix": False},
    "timeComplexity": "O(log n)",
    "spaceComplexity": "O(1)",
    "explanation": "Binary Search works by repeatedly dividing the search interval in half. If the target value is less than the middle element, the search continues in the lower half. Otherwise, it continues in the upper half. This halving makes it very efficient for sorted arrays.",
    "dataStructures": ["array"],
    "patterns": ["loop", "divide-and-conquer"],
    "input": "arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23",
    "fromCache": False,
    "steps": [
        {"step": 1, "line": 1, "description": "Initialize: low=0, high=9, searching for target=23", "action": "initialize", "variables": {"low": 0, "high": 9, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [], "pointers": {"low": 0, "high": 9}},
        {"step": 2, "line": 3, "description": "Calculate mid = (0+9)//2 = 4. arr[4]=16", "action": "compare", "variables": {"low": 0, "high": 9, "mid": 4, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [4], "pointers": {"low": 0, "mid": 4, "high": 9}},
        {"step": 3, "line": 5, "description": "16 < 23 → target is in right half. Set low = mid+1 = 5", "action": "highlight", "variables": {"low": 5, "high": 9, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [5, 6, 7, 8, 9], "pointers": {"low": 5, "high": 9}},
        {"step": 4, "line": 3, "description": "Calculate mid = (5+9)//2 = 7. arr[7]=56", "action": "compare", "variables": {"low": 5, "high": 9, "mid": 7, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [7], "pointers": {"low": 5, "mid": 7, "high": 9}},
        {"step": 5, "line": 7, "description": "56 > 23 → target is in left half. Set high = mid-1 = 6", "action": "highlight", "variables": {"low": 5, "high": 6, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [5, 6], "pointers": {"low": 5, "high": 6}},
        {"step": 6, "line": 3, "description": "Calculate mid = (5+6)//2 = 5. arr[5]=23", "action": "compare", "variables": {"low": 5, "high": 6, "mid": 5, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [5], "pointers": {"low": 5, "mid": 5, "high": 6}},
        {"step": 7, "line": 4, "description": "arr[5]=23 == target=23 → Found! Return index 5", "action": "return", "variables": {"result": 5, "target": 23}, "array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "highlights": [5], "pointers": {"found": 5}},
    ],
}

BFS_RESULT = {
    "algorithm": "Breadth-First Search (BFS)",
    "algorithmType": "graph-traversal",
    "visualizationType": "3d-graph",
    "renderMode": "3d",
    "vizConfig": {"visualizationType": "3d-graph", "renderMode": "3d", "layout": "force-directed",
                  "animationStyle": "traverse", "colorScheme": "status", "elementShape": "node",
                  "showPointers": False, "showCallStack": False, "showDPTable": False, "showMatrix": False},
    "timeComplexity": "O(V + E)",
    "spaceComplexity": "O(V)",
    "explanation": "BFS explores a graph level by level, starting from a source node. It uses a queue to keep track of nodes to visit. All neighbors of the current node are visited before moving to the next level.",
    "dataStructures": ["graph", "queue", "set"],
    "patterns": ["loop", "queue-based"],
    "input": "Graph with 6 nodes, starting from node 0",
    "fromCache": False,
    "steps": [
        {"step": 1, "line": 1, "description": "Initialize BFS from node 0. Add to queue and visited set.", "action": "initialize", "variables": {"queue": [0], "visited": [0]},
         "nodes": [{"id": "0", "value": 0, "x": 0, "y": 0}, {"id": "1", "value": 1, "x": -2, "y": -2}, {"id": "2", "value": 2, "x": 2, "y": -2}, {"id": "3", "value": 3, "x": -3, "y": -4}, {"id": "4", "value": 4, "x": 0, "y": -4}, {"id": "5", "value": 5, "x": 3, "y": -4}],
         "edges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "4"}, {"from": "2", "to": "5"}],
         "activeNodes": ["0"], "activeEdges": [], "highlights": [], "pointers": {}, "array": None},
        {"step": 2, "line": 3, "description": "Dequeue node 0. Visit neighbors: 1, 2", "action": "visit", "variables": {"queue": [1, 2], "visited": [0, 1, 2], "current": 0},
         "nodes": [{"id": "0", "value": 0, "x": 0, "y": 0}, {"id": "1", "value": 1, "x": -2, "y": -2}, {"id": "2", "value": 2, "x": 2, "y": -2}, {"id": "3", "value": 3, "x": -3, "y": -4}, {"id": "4", "value": 4, "x": 0, "y": -4}, {"id": "5", "value": 5, "x": 3, "y": -4}],
         "edges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "4"}, {"from": "2", "to": "5"}],
         "activeNodes": ["0", "1", "2"], "activeEdges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}], "highlights": [], "pointers": {}, "array": None},
        {"step": 3, "line": 3, "description": "Dequeue node 1. Visit neighbors: 3, 4", "action": "visit", "variables": {"queue": [2, 3, 4], "visited": [0, 1, 2, 3, 4], "current": 1},
         "nodes": [{"id": "0", "value": 0, "x": 0, "y": 0}, {"id": "1", "value": 1, "x": -2, "y": -2}, {"id": "2", "value": 2, "x": 2, "y": -2}, {"id": "3", "value": 3, "x": -3, "y": -4}, {"id": "4", "value": 4, "x": 0, "y": -4}, {"id": "5", "value": 5, "x": 3, "y": -4}],
         "edges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "4"}, {"from": "2", "to": "5"}],
         "activeNodes": ["1", "3", "4"], "activeEdges": [{"from": "1", "to": "3"}, {"from": "1", "to": "4"}], "highlights": [], "pointers": {}, "array": None},
        {"step": 4, "line": 3, "description": "Dequeue node 2. Visit neighbor: 5 (node 4 already visited)", "action": "visit", "variables": {"queue": [3, 4, 5], "visited": [0, 1, 2, 3, 4, 5], "current": 2},
         "nodes": [{"id": "0", "value": 0, "x": 0, "y": 0}, {"id": "1", "value": 1, "x": -2, "y": -2}, {"id": "2", "value": 2, "x": 2, "y": -2}, {"id": "3", "value": 3, "x": -3, "y": -4}, {"id": "4", "value": 4, "x": 0, "y": -4}, {"id": "5", "value": 5, "x": 3, "y": -4}],
         "edges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "4"}, {"from": "2", "to": "5"}],
         "activeNodes": ["2", "5"], "activeEdges": [{"from": "2", "to": "5"}], "highlights": [], "pointers": {}, "array": None},
        {"step": 5, "line": 3, "description": "Process remaining nodes 3, 4, 5 — no unvisited neighbors", "action": "visit", "variables": {"queue": [], "visited": [0, 1, 2, 3, 4, 5]},
         "nodes": [{"id": "0", "value": 0, "x": 0, "y": 0}, {"id": "1", "value": 1, "x": -2, "y": -2}, {"id": "2", "value": 2, "x": 2, "y": -2}, {"id": "3", "value": 3, "x": -3, "y": -4}, {"id": "4", "value": 4, "x": 0, "y": -4}, {"id": "5", "value": 5, "x": 3, "y": -4}],
         "edges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "4"}, {"from": "2", "to": "5"}],
         "activeNodes": ["0", "1", "2", "3", "4", "5"], "activeEdges": [], "highlights": [], "pointers": {}, "array": None},
        {"step": 6, "line": 8, "description": "BFS complete. Traversal order: 0 → 1 → 2 → 3 → 4 → 5", "action": "return", "variables": {"traversal_order": [0, 1, 2, 3, 4, 5]},
         "nodes": [{"id": "0", "value": 0, "x": 0, "y": 0}, {"id": "1", "value": 1, "x": -2, "y": -2}, {"id": "2", "value": 2, "x": 2, "y": -2}, {"id": "3", "value": 3, "x": -3, "y": -4}, {"id": "4", "value": 4, "x": 0, "y": -4}, {"id": "5", "value": 5, "x": 3, "y": -4}],
         "edges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "4"}, {"from": "2", "to": "5"}],
         "activeNodes": ["0", "1", "2", "3", "4", "5"], "activeEdges": [{"from": "0", "to": "1"}, {"from": "0", "to": "2"}, {"from": "1", "to": "3"}, {"from": "1", "to": "4"}, {"from": "2", "to": "5"}], "highlights": [], "pointers": {}, "array": None},
    ],
}

TWO_SUM_RESULT = {
    "algorithm": "Two Sum",
    "algorithmType": "hash-map",
    "visualizationType": "2d-bars",
    "renderMode": "2d",
    "vizConfig": {"visualizationType": "2d-bars", "renderMode": "2d", "layout": "horizontal",
                  "animationStyle": "highlight", "colorScheme": "comparison", "elementShape": "bar",
                  "showPointers": True, "showCallStack": False, "showDPTable": False, "showMatrix": False},
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "explanation": "Two Sum uses a hash map to store each number's index as we iterate. For each element, we check if its complement (target - current) already exists in the map. This gives O(n) time instead of O(n²) brute force.",
    "dataStructures": ["array", "hash-map"],
    "patterns": ["hash-map-lookup", "single-pass"],
    "input": "nums = [2, 7, 11, 15], target = 9",
    "inputData": {"nums": [2, 7, 11, 15], "target": 9},
    "fromCache": False,
    "steps": [
        {"step": 1, "line": 2, "description": "Initialize empty hash map: seen = {}", "action": "initialize", "variables": {"seen": {}, "target": 9}, "array": [2, 7, 11, 15], "highlights": [], "pointers": {}},
        {"step": 2, "line": 3, "description": "i=0, num=2. Calculate complement = 9 - 2 = 7", "action": "compare", "variables": {"i": 0, "num": 2, "complement": 7, "seen": {}}, "array": [2, 7, 11, 15], "highlights": [0], "pointers": {"i": 0}},
        {"step": 3, "line": 5, "description": "7 not in seen → Add 2:0 to hash map", "action": "highlight", "variables": {"i": 0, "num": 2, "seen": {"2": 0}}, "array": [2, 7, 11, 15], "highlights": [0], "pointers": {"i": 0}},
        {"step": 4, "line": 3, "description": "i=1, num=7. Calculate complement = 9 - 7 = 2", "action": "compare", "variables": {"i": 1, "num": 7, "complement": 2, "seen": {"2": 0}}, "array": [2, 7, 11, 15], "highlights": [1], "pointers": {"i": 1}},
        {"step": 5, "line": 5, "description": "2 IS in seen at index 0! Found pair: nums[0]=2 + nums[1]=7 = 9", "action": "swap", "variables": {"result": [0, 1], "seen": {"2": 0}}, "array": [2, 7, 11, 15], "highlights": [0, 1], "pointers": {"found": 0, "found2": 1}},
        {"step": 6, "line": 6, "description": "Return [0, 1] — indices of the two numbers that sum to 9", "action": "return", "variables": {"result": [0, 1]}, "array": [2, 7, 11, 15], "highlights": [0, 1], "pointers": {"ans1": 0, "ans2": 1}},
    ],
}

SELECTION_SORT_RESULT = {
    "algorithm": "Selection Sort",
    "algorithmType": "sorting",
    "visualizationType": "2d-bars",
    "renderMode": "2d",
    "vizConfig": {"visualizationType": "2d-bars", "renderMode": "2d", "layout": "horizontal",
                  "animationStyle": "swap", "colorScheme": "comparison", "elementShape": "bar",
                  "showPointers": True, "showCallStack": False, "showDPTable": False, "showMatrix": False},
    "timeComplexity": "O(n²)",
    "spaceComplexity": "O(1)",
    "explanation": "Selection Sort divides the array into sorted and unsorted regions. It repeatedly finds the minimum element from the unsorted region and places it at the beginning of the unsorted region.",
    "dataStructures": ["array"],
    "patterns": ["nested-loop", "selection", "swap"],
    "input": "arr = [64, 25, 12, 22, 11]",
    "inputData": {"arr": [64, 25, 12, 22, 11]},
    "fromCache": False,
    "steps": [
        {"step": 1, "line": 1, "description": "Start Selection Sort on [64, 25, 12, 22, 11]", "action": "initialize", "variables": {"arr": [64, 25, 12, 22, 11]}, "array": [64, 25, 12, 22, 11], "highlights": [], "pointers": {}},
        {"step": 2, "line": 3, "description": "i=0: Find minimum in [64, 25, 12, 22, 11]. min_idx=4 (value=11)", "action": "compare", "variables": {"i": 0, "min_idx": 4}, "array": [64, 25, 12, 22, 11], "highlights": [0, 4], "pointers": {"i": 0, "min": 4}},
        {"step": 3, "line": 5, "description": "Swap arr[0]=64 with arr[4]=11", "action": "swap", "variables": {"i": 0, "min_idx": 4}, "array": [11, 25, 12, 22, 64], "highlights": [0, 4], "pointers": {"i": 0, "min": 4}},
        {"step": 4, "line": 3, "description": "i=1: Find minimum in [25, 12, 22, 64]. min_idx=2 (value=12)", "action": "compare", "variables": {"i": 1, "min_idx": 2}, "array": [11, 25, 12, 22, 64], "highlights": [1, 2], "pointers": {"i": 1, "min": 2}},
        {"step": 5, "line": 5, "description": "Swap arr[1]=25 with arr[2]=12", "action": "swap", "variables": {"i": 1, "min_idx": 2}, "array": [11, 12, 25, 22, 64], "highlights": [1, 2], "pointers": {"i": 1, "min": 2}},
        {"step": 6, "line": 3, "description": "i=2: Find minimum in [25, 22, 64]. min_idx=3 (value=22)", "action": "compare", "variables": {"i": 2, "min_idx": 3}, "array": [11, 12, 25, 22, 64], "highlights": [2, 3], "pointers": {"i": 2, "min": 3}},
        {"step": 7, "line": 5, "description": "Swap arr[2]=25 with arr[3]=22", "action": "swap", "variables": {"i": 2, "min_idx": 3}, "array": [11, 12, 22, 25, 64], "highlights": [2, 3], "pointers": {"i": 2, "min": 3}},
        {"step": 8, "line": 3, "description": "i=3: Minimum in [25, 64] is 25, already in place", "action": "compare", "variables": {"i": 3, "min_idx": 3}, "array": [11, 12, 22, 25, 64], "highlights": [3], "pointers": {"i": 3}},
        {"step": 9, "line": 7, "description": "Array is sorted: [11, 12, 22, 25, 64]", "action": "return", "variables": {"result": [11, 12, 22, 25, 64]}, "array": [11, 12, 22, 25, 64], "highlights": [0, 1, 2, 3, 4], "pointers": {}},
    ],
}

FALLBACK_MAP = {
    "bubble_sort": BUBBLE_SORT_RESULT,
    "binary_search": BINARY_SEARCH_RESULT,
    "bfs": BFS_RESULT,
    "dfs": BFS_RESULT,
    "two_sum": TWO_SUM_RESULT,
    "selection_sort": SELECTION_SORT_RESULT,
}


def get_fallback_result(language: str, code: str) -> dict | None:
    """Return a pre-built result if the algorithm matches a known pattern."""
    algo = detect_algorithm(code)
    result = FALLBACK_MAP.get(algo)
    if result:
        r = {**result}
        r["codeLines"] = code.strip().split("\n")
        r["totalSteps"] = len(r["steps"])
        r["processingTime"] = 0.01
        r["fromCache"] = False
        r["fallbackMode"] = True
        return r
    return None
