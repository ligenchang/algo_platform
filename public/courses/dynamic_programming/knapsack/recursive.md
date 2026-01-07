# 2. The Recursive Solution

## Thinking Recursively

The beauty of the knapsack problem is that it has a natural recursive structure. At each step, we face a simple decision for the current item:

**For item `i` with weight `w[i]` and value `v[i]`:**

1. **Don't take it:** Move to the next item with the same capacity  
   → Result: `knapsack(i-1, capacity)`

2. **Take it (if it fits):** Add its value and reduce capacity  
   → Result: `v[i] + knapsack(i-1, capacity - w[i])`

**Choose whichever gives the maximum value!**

---

## The Recursive Algorithm

```python
def knapsack_recursive(weights, values, n, capacity):
    """
    Solve 0/1 Knapsack using pure recursion.
    
    Args:
        weights: list of item weights
        values: list of item values
        n: number of items to consider (index from 0 to n-1)
        capacity: remaining capacity of knapsack
    
    Returns:
        Maximum value achievable
    """
    # Base case: no items left or no capacity left
    if n == 0 or capacity == 0:
        return 0
    
    # If current item is too heavy, skip it
    if weights[n-1] > capacity:
        return knapsack_recursive(weights, values, n-1, capacity)
    
    # Otherwise, try both options and pick the best
    exclude = knapsack_recursive(weights, values, n-1, capacity)
    include = values[n-1] + knapsack_recursive(weights, values, n-1, capacity - weights[n-1])
    
    return max(exclude, include)
```

---

## Walking Through an Example

Let's trace through our example with capacity = 7 kg:

```
Items:
0: Ring (w=1, v=15)
1: Camera (w=3, v=10)
2: Laptop (w=4, v=30)
3: Game Console (w=5, v=25)
```

**Initial call:** `knapsack_recursive(weights, values, 4, 7)`

We start at item 3 (Game Console):
- **Exclude:** `knapsack_recursive(..., 3, 7)` → solve for first 3 items with capacity 7
- **Include:** `25 + knapsack_recursive(..., 3, 2)` → add value 25, solve for first 3 items with capacity 2

The recursion tree expands, exploring both branches for each item:

```
                    knapsack(4, 7)
                   /              \
          knapsack(3, 7)      25 + knapsack(3, 2)
           /          \             /           \
    knapsack(2, 7)  30+knapsack(2,3)  ...      ...
       /      \
     ...      ...
```

Eventually, all paths reach base cases and return values back up the tree.

---

## Testing the Recursive Solution

```python
# Test with our example
weights = [1, 3, 4, 5]
values = [15, 10, 30, 25]
capacity = 7
n = len(weights)

result = knapsack_recursive(weights, values, n, capacity)
print(f"Maximum value: ${result}")  # Output: Maximum value: $45
```

✓ **It works!** The recursive solution correctly finds the optimal value of $45.

---

## The Problem: Exponential Time Complexity

While the recursive solution is elegant and intuitive, it has a critical flaw: **overlapping subproblems**.

Consider this: many branches of the recursion tree compute the same subproblem multiple times.

For example, `knapsack(2, 5)` (first 2 items with capacity 5) might be computed dozens of times through different paths!

**Time Complexity:** O(2^n) — exponential!
- With 20 items: ~1 million operations
- With 30 items: ~1 billion operations  
- With 40 items: ~1 trillion operations

For n=4, it's manageable. But for n=30? Your program would take days to finish.

---

## Key Insights

1. ✓ **Recursive structure is clear and correct**
2. ✓ **Base cases handle edge conditions properly**
3. ✗ **Massive redundant computation** (same subproblems solved repeatedly)
4. ✗ **Exponential time complexity** (impractical for large inputs)

**The solution?** In the next section, we'll add **memoization** to cache subproblem results and avoid redundant computation. This transforms our O(2^n) solution into O(n × capacity) — a massive improvement!

---

## Try It Yourself

Before moving on, try answering:

1. What happens if all items are too heavy for the knapsack?
2. What happens if capacity is 0?
3. How many times does `knapsack(1, 3)` get computed in our example?

Understanding these questions will help you appreciate why memoization is so powerful.
