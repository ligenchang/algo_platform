# 5. Space Optimization

## The Opportunity

Our tabulation solution uses a 2D table: `dp[n+1][capacity+1]`

**Space complexity:** O(n × capacity)

But here's the key observation: when computing row `i`, we **only need values from row `i-1`**. We never look at rows `i-2`, `i-3`, etc.

**Can we reduce O(n × capacity) space to just O(capacity)?**

Yes! Let's see how.

---

## Optimization 1: Two Rows

Instead of storing all n+1 rows, keep only two: **previous row** and **current row**.

```python
def knapsack_two_rows(weights, values, capacity):
    """
    Space-optimized with two rows: O(2 × capacity) = O(capacity)
    """
    n = len(weights)
    
    # Only need two rows
    prev = [0] * (capacity + 1)
    curr = [0] * (capacity + 1)
    
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Don't take item i-1
            curr[w] = prev[w]
            
            # Take item i-1 (if it fits)
            if weights[i-1] <= w:
                include_value = values[i-1] + prev[w - weights[i-1]]
                curr[w] = max(curr[w], include_value)
        
        # Swap: current becomes previous for next iteration
        prev, curr = curr, prev
    
    return prev[capacity]
```

**Space reduced from O(n × capacity) to O(2 × capacity) = O(capacity)!**

But we can do even better...

---

## Optimization 2: Single Array (Right-to-Left)

Can we use just **one** array instead of two?

The trick: **iterate through capacities from right to left (high to low)**.

### Why Right-to-Left?

When we update `dp[w]`, we need the old value of `dp[w - weights[i-1]]` from the previous iteration.

- **Left-to-right:** We'd overwrite `dp[w - weights[i-1]]` before using it ❌
- **Right-to-left:** By the time we update `dp[w]`, we haven't touched `dp[w - weights[i-1]]` yet ✓

```python
def knapsack_optimized(weights, values, capacity):
    """
    Space-optimized with single array: O(capacity)
    
    Key insight: Process capacities from right to left
    so we don't overwrite values we still need.
    """
    n = len(weights)
    
    # Single 1D array
    dp = [0] * (capacity + 1)
    
    for i in range(n):
        # CRITICAL: Iterate from right to left!
        for w in range(capacity, weights[i] - 1, -1):
            # Take item i or don't take it
            dp[w] = max(
                dp[w],                            # don't take
                values[i] + dp[w - weights[i]]    # take
            )
    
    return dp[capacity]
```

**Space reduced to O(capacity) with just one array!** 🎉

---

## Why Right-to-Left Works: A Visual

Consider updating for item with weight=3:

### Left-to-Right (WRONG):
```
Initial:  [0, 5, 5, 5, 5, 5]  (previous row)
          
w=3: dp[3] = max(5, value + dp[0]) = 10
     [0, 5, 5, 10, 5, 5]
          
w=4: dp[4] = max(5, value + dp[1]) = ...
     We need OLD dp[1], but it hasn't changed yet (lucky)
          
w=5: dp[5] = max(5, value + dp[2]) = ...
     We need OLD dp[2], but it hasn't changed yet (lucky)
          
w=6: dp[6] = max(5, value + dp[3]) = ...
     ❌ We need OLD dp[3]=5, but we already changed it to 10!
```

### Right-to-Left (CORRECT):
```
Initial:  [0, 5, 5, 5, 5, 5]  (previous row)
          
w=6: dp[6] = max(5, value + dp[3]) = ...
     ✓ dp[3] is still OLD value (5)
     
w=5: dp[5] = max(5, value + dp[2]) = ...
     ✓ dp[2] is still OLD value (5)
     
w=4: dp[4] = max(5, value + dp[1]) = ...
     ✓ dp[1] is still OLD value (5)
     
w=3: dp[3] = max(5, value + dp[0]) = 10
     Now we can safely update dp[3]
```

By going right-to-left, we ensure we never read a value that we've already updated in this iteration!

---

## Complete Optimized Implementation

```python
def knapsack_optimized(weights, values, capacity):
    """
    Fully optimized 0/1 Knapsack with O(capacity) space.
    
    Time: O(n × capacity)
    Space: O(capacity)
    """
    dp = [0] * (capacity + 1)
    
    # Process each item
    for i in range(len(weights)):
        # Process capacities from high to low
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(
                dp[w],                           # don't take item i
                values[i] + dp[w - weights[i]]   # take item i
            )
    
    return dp[capacity]

# Test it
weights = [1, 3, 4, 5]
values = [15, 10, 30, 25]
capacity = 7

result = knapsack_optimized(weights, values, capacity)
print(f"Maximum value: ${result}")  # Output: $45
```

---

## Performance Comparison

| Solution | Time | Space | For n=1000, capacity=10000 |
|----------|------|-------|----------------------------|
| Recursive | O(2^n) | O(n) | Impossible |
| Memoization | O(n × C) | O(n × C) | ~10 million cells |
| Tabulation | O(n × C) | O(n × C) | ~10 million cells |
| **Optimized** | **O(n × C)** | **O(C)** | **~10,000 cells** |

The optimized version uses **1000× less memory** than tabulation!

---

## Trade-offs

### Advantages:
- ✓ **Minimal space usage** (only O(capacity))
- ✓ **Same time complexity** (O(n × capacity))
- ✓ **Simple and elegant** (just one array!)

### Disadvantages:
- ✗ **Can't backtrack to find items** (we don't keep the full table)
- ✗ **Less intuitive** (right-to-left iteration isn't obvious)

**When to use:**
- If you only need the maximum value (not the items)
- When memory is constrained
- When capacity is large but you still need DP

**When to use 2D table:**
- If you need to know which items were selected
- When the code clarity is more important than space
- For teaching/learning purposes (easier to visualize)

---

## Can We Find Items with Space Optimization?

Yes, but it requires a clever trick: **run the algorithm a second time** while backtracking.

```python
def knapsack_optimized_with_items(weights, values, capacity):
    """
    Space-optimized version that also returns selected items.
    
    Strategy: Run optimization once for value, then backtrack
    by re-running with reduced item sets.
    """
    n = len(weights)
    
    # First pass: get maximum value
    dp = [0] * (capacity + 1)
    for i in range(n):
        for w in range(capacity, weights[i] - 1, -1):
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    
    max_value = dp[capacity]
    
    # Second pass: backtrack to find items
    selected = []
    remaining_capacity = capacity
    
    # Check items in reverse order
    for i in range(n - 1, -1, -1):
        # Re-run DP without this item
        temp_dp = [0] * (capacity + 1)
        for j in range(i):  # only items 0 to i-1
            for w in range(capacity, weights[j] - 1, -1):
                temp_dp[w] = max(temp_dp[w], values[j] + temp_dp[w - weights[j]])
        
        # If value changed, we must have taken item i
        if temp_dp[remaining_capacity] != dp[remaining_capacity]:
            selected.append(i)
            remaining_capacity -= weights[i]
        
        dp = temp_dp  # update for next iteration
    
    selected.reverse()
    return max_value, selected
```

**Note:** This approach is less efficient (runs DP multiple times), so if you need items, the 2D table is usually better.

---

## Final Comparison Table

| Approach | Time | Space | Gets Items? | Best For |
|----------|------|-------|-------------|----------|
| Recursive | O(2^n) | O(n) | Yes (modify) | Understanding |
| Memoization | O(n×C) | O(n×C) | Yes (modify) | Natural recursion |
| Tabulation | O(n×C) | O(n×C) | Yes (easy) | Need items + clarity |
| **1D Optimized** | **O(n×C)** | **O(C)** | No (complex) | **Large capacity, value only** |

---

## Key Insights

1. ✓ **Space optimization is powerful** (1000× less memory!)
2. ✓ **Right-to-left is key** (preserves needed values)
3. ✓ **Trade-off: space vs. item tracking** (can't have both easily)
4. ✓ **Choose the right tool** (2D for items, 1D for space)

---

## Try It Yourself

1. Trace the 1D array for our example step-by-step
2. What happens if you iterate left-to-right? Try it and see the wrong answer!
3. Implement the "two rows" version and verify it works
4. When would you use 2D table vs. 1D array in practice?

In the next section, we'll practice applying these techniques to related problems!
