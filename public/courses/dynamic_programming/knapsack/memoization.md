# 3. Memoization (Top-Down Dynamic Programming)

## The Problem Recap

Our recursive solution works perfectly, but it's slow because it solves the same subproblems over and over again.

**Example:** When computing `knapsack(4, 7)`, the subproblem `knapsack(2, 3)` might be computed through multiple different paths:
- Path 1: knapsack(4,7) → knapsack(3,7) → knapsack(2,3)
- Path 2: knapsack(4,7) → knapsack(3,2) → knapsack(2,3)
- And so on...

Each time we recompute it from scratch. What a waste!

---

## The Solution: Memoization

**Memoization** is a simple but powerful idea:
1. Before computing a subproblem, check if we've already solved it
2. If yes, return the cached result immediately
3. If no, compute it, store the result, then return it

This ensures each unique subproblem is solved **exactly once**.

---

## Implementation with a Dictionary

```python
def knapsack_memo(weights, values, n, capacity, memo=None):
    """
    Solve 0/1 Knapsack using memoization (top-down DP).
    
    Args:
        weights: list of item weights
        values: list of item values
        n: number of items to consider
        capacity: remaining capacity
        memo: dictionary to cache results
    
    Returns:
        Maximum value achievable
    """
    # Initialize memo on first call
    if memo is None:
        memo = {}
    
    # Check if we've already solved this subproblem
    if (n, capacity) in memo:
        return memo[(n, capacity)]
    
    # Base case: no items or no capacity
    if n == 0 or capacity == 0:
        return 0
    
    # If current item is too heavy, skip it
    if weights[n-1] > capacity:
        result = knapsack_memo(weights, values, n-1, capacity, memo)
    else:
        # Try both options: exclude and include
        exclude = knapsack_memo(weights, values, n-1, capacity, memo)
        include = values[n-1] + knapsack_memo(weights, values, n-1, capacity - weights[n-1], memo)
        result = max(exclude, include)
    
    # Store result in memo before returning
    memo[(n, capacity)] = result
    return result
```

---

## What Changed?

Compare to the recursive version:

```python
# RECURSIVE (slow)
def knapsack_recursive(weights, values, n, capacity):
    if n == 0 or capacity == 0:
        return 0
    # ... recursive calls ...

# MEMOIZED (fast)
def knapsack_memo(weights, values, n, capacity, memo=None):
    if memo is None:
        memo = {}
    
    # 👇 NEW: Check cache first
    if (n, capacity) in memo:
        return memo[(n, capacity)]
    
    if n == 0 or capacity == 0:
        return 0
    # ... recursive calls ...
    
    # 👇 NEW: Store result in cache
    memo[(n, capacity)] = result
    return result
```

**Only 3 lines added**, but the performance improvement is **dramatic**!

---

## Visualizing the Difference

### Recursive (without memoization):
```
knapsack(4, 7)
├─ knapsack(3, 7)
│  ├─ knapsack(2, 7)
│  │  ├─ knapsack(1, 7)  ← computed
│  │  └─ knapsack(1, 3)  ← computed
│  └─ knapsack(2, 3)
│     ├─ knapsack(1, 3)  ← RECOMPUTED! 😢
│     └─ knapsack(1, 0)
└─ knapsack(3, 2)
   ├─ knapsack(2, 2)
   │  ├─ knapsack(1, 2)
   │  └─ knapsack(1, -2) [invalid]
   └─ knapsack(2, -3) [invalid]
```

Many subproblems are computed multiple times!

### Memoized (with cache):
```
knapsack(4, 7)
├─ knapsack(3, 7)
│  ├─ knapsack(2, 7)
│  │  ├─ knapsack(1, 7)  ← computed & cached
│  │  └─ knapsack(1, 3)  ← computed & cached
│  └─ knapsack(2, 3)
│     ├─ knapsack(1, 3)  ← CACHE HIT! ✓
│     └─ knapsack(1, 0)  ← computed & cached
└─ knapsack(3, 2)  [continues with cache lookups]
```

Each unique subproblem is computed **only once**!

---

## Performance Analysis

**Time Complexity:** O(n × capacity)
- There are `n × capacity` unique subproblems
- Each subproblem is computed once and cached
- Looking up cached results is O(1)

**Space Complexity:** O(n × capacity)
- The memo dictionary stores up to `n × capacity` entries
- Plus O(n) for the recursion call stack

**Comparison:**

| Solution | Time | Space | n=30, capacity=1000 |
|----------|------|-------|---------------------|
| Recursive | O(2^n) | O(n) | ~1 billion ops |
| Memoized | O(n × C) | O(n × C) | ~30,000 ops |

**That's over 30,000× faster!** 🚀

---

## Testing the Memoized Solution

```python
# Same example as before
weights = [1, 3, 4, 5]
values = [15, 10, 30, 25]
capacity = 7
n = len(weights)

result = knapsack_memo(weights, values, n, capacity)
print(f"Maximum value: ${result}")  # Output: Maximum value: $45

# Try a larger example (would be too slow with recursion)
import random
random.seed(42)
n_items = 30
large_weights = [random.randint(1, 20) for _ in range(n_items)]
large_values = [random.randint(10, 100) for _ in range(n_items)]
large_capacity = 100

result = knapsack_memo(large_weights, large_values, n_items, large_capacity)
print(f"Maximum value (30 items): ${result}")  # Computes instantly!
```

---

## Key Insights

1. ✓ **Same correct logic as recursion** (we just added caching)
2. ✓ **Massive speedup** (exponential → polynomial time)
3. ✓ **Easy to implement** (only a few extra lines)
4. ✓ **Handles large inputs** (30+ items run instantly)
5. ⚠️ **Uses extra memory** (need to store the cache)

---

## But Wait, Can We Do Better?

Memoization is fantastic, but it has one limitation: **space complexity**. We're storing O(n × capacity) entries in memory.

Also, memoization is **top-down** (starts from the original problem and breaks it down). But there's another approach: **bottom-up**, where we build solutions from the smallest subproblems up to the final answer.

In the next section, we'll explore **tabulation**: a bottom-up approach that often has better space optimization opportunities and avoids recursion overhead entirely.

---

## Try It Yourself

1. Add print statements to see which subproblems get cached vs. computed
2. What's the maximum cache size needed for n=4, capacity=7?
3. How would you modify the code to also track which items were selected?
