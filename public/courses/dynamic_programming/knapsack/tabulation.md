# 4. Tabulation (Bottom-Up Dynamic Programming)

## From Top-Down to Bottom-Up

So far, we've used **top-down** approaches:
- **Recursive:** Start with the full problem, break it into subproblems
- **Memoization:** Same, but cache results to avoid recomputation

Now we'll flip the approach: **bottom-up tabulation**.

Instead of starting with the big problem and recursing down, we:
1. Start with the smallest subproblems (base cases)
2. Build up solutions to progressively larger subproblems
3. Arrive at the final answer without any recursion

---

## The DP Table

We'll use a 2D table `dp[i][w]` where:
- `i` = number of items considered (0 to n)
- `w` = capacity considered (0 to capacity)
- `dp[i][w]` = maximum value achievable with first `i` items and capacity `w`

### Example Table Structure (n=4, capacity=7):

|   | w=0 | w=1 | w=2 | w=3 | w=4 | w=5 | w=6 | w=7 |
|---|-----|-----|-----|-----|-----|-----|-----|-----|
| **i=0** (no items) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **i=1** (Ring: w=1, v=15) | 0 | 15 | 15 | 15 | 15 | 15 | 15 | 15 |
| **i=2** (+ Camera: w=3, v=10) | 0 | 15 | 15 | 15 | 15 | 25 | 25 | 25 |
| **i=3** (+ Laptop: w=4, v=30) | 0 | 15 | 15 | 15 | 30 | 30 | 30 | 45 |
| **i=4** (+ Console: w=5, v=25) | 0 | 15 | 15 | 15 | 30 | 30 | 30 | 45 |

The bottom-right cell `dp[4][7] = 45` is our answer!

---

## The Recurrence Relation

For each cell `dp[i][w]`, we have two choices:

**1. Don't take item i:**
```
dp[i][w] = dp[i-1][w]
```
(Same as the value without this item)

**2. Take item i (if it fits):**
```
dp[i][w] = values[i-1] + dp[i-1][w - weights[i-1]]
```
(Add item's value to the best solution with remaining capacity)

**Final formula:**
```
dp[i][w] = max(
    dp[i-1][w],                              # don't take item i
    values[i-1] + dp[i-1][w - weights[i-1]]  # take item i (if fits)
)
```

---

## Implementation

```python
def knapsack_tabulation(weights, values, capacity):
    """
    Solve 0/1 Knapsack using tabulation (bottom-up DP).
    
    Args:
        weights: list of item weights
        values: list of item values
        capacity: knapsack capacity
    
    Returns:
        Maximum value achievable
    """
    n = len(weights)
    
    # Create DP table: (n+1) x (capacity+1)
    # dp[i][w] = max value with first i items and capacity w
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    # Fill the table bottom-up
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            # Option 1: Don't take item i-1
            dp[i][w] = dp[i-1][w]
            
            # Option 2: Take item i-1 (if it fits)
            if weights[i-1] <= w:
                include_value = values[i-1] + dp[i-1][w - weights[i-1]]
                dp[i][w] = max(dp[i][w], include_value)
    
    # The answer is in the bottom-right corner
    return dp[n][capacity]
```

---

## Step-by-Step Trace

Let's fill the table for our example: `weights=[1,3,4,5]`, `values=[15,10,30,25]`, `capacity=7`

### Row 0 (no items):
All zeros (can't get any value with no items)

### Row 1 (Ring: w=1, v=15):
- `w=0`: Can't fit → `dp[1][0] = 0`
- `w=1`: Fits! → `dp[1][1] = 15`
- `w=2` to `w=7`: Still just the ring → `dp[1][2..7] = 15`

### Row 2 (Ring + Camera: w=3, v=10):
- `w=0` to `w=2`: Only ring fits → `dp[2][0..2] = 0, 15, 15`
- `w=3`: Can take camera (10) OR ring (15) → `max(10, 15) = 15`
- `w=4`: Can take ring + camera (15+10) → `dp[2][4] = 25`
- `w=5` to `w=7`: Same → `dp[2][5..7] = 25`

### Row 3 (Ring + Camera + Laptop: w=4, v=30):
- `w=4`: Can take laptop (30) OR ring+camera (25) → `max(30, 25) = 30`
- `w=5`: Laptop + Ring (30+15) = 45 OR previous (25) → `45`
- `w=7`: Ring + Laptop = 45

### Row 4 (All items including Console):
- Console is heavy (w=5), doesn't improve solution → `dp[4][7] = 45`

**Final answer: `dp[4][7] = 45`** ✓

---

## Comparison: Memoization vs. Tabulation

| Aspect | Memoization (Top-Down) | Tabulation (Bottom-Up) |
|--------|------------------------|------------------------|
| **Approach** | Recursive with cache | Iterative with table |
| **Start point** | Original problem | Base cases |
| **Direction** | Problem → subproblems | Subproblems → problem |
| **Time** | O(n × capacity) | O(n × capacity) |
| **Space** | O(n × capacity) + O(n) stack | O(n × capacity) |
| **Overhead** | Function calls | None |
| **Optimization** | Harder to optimize space | Easier to optimize space |

Both have the same time complexity, but tabulation:
- ✓ **No recursion overhead** (faster in practice)
- ✓ **Better for space optimization** (we'll see this next)
- ✓ **Predictable memory access pattern** (better cache locality)

---

## Finding Which Items Were Selected

The table not only gives us the maximum value but can also tell us **which items** we chose:

```python
def knapsack_tabulation_with_items(weights, values, capacity):
    """
    Returns both max value and list of selected items.
    """
    n = len(weights)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    # Fill table (same as before)
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                include_value = values[i-1] + dp[i-1][w - weights[i-1]]
                dp[i][w] = max(dp[i][w], include_value)
    
    # Backtrack to find which items were selected
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        # If value changed, we took this item
        if dp[i][w] != dp[i-1][w]:
            selected.append(i-1)  # item index
            w -= weights[i-1]     # reduce remaining capacity
    
    selected.reverse()  # restore original order
    return dp[n][capacity], selected

# Test it
weights = [1, 3, 4, 5]
values = [15, 10, 30, 25]
capacity = 7

max_value, items = knapsack_tabulation_with_items(weights, values, capacity)
print(f"Maximum value: ${max_value}")
print(f"Items selected: {items}")  # [0, 2] → Ring and Laptop

for idx in items:
    print(f"  - Item {idx}: weight={weights[idx]}, value=${values[idx]}")
```

Output:
```
Maximum value: $45
Items selected: [0, 2]
  - Item 0: weight=1, value=$15
  - Item 2: weight=4, value=$30
```

---

## Key Insights

1. ✓ **No recursion** (avoids call stack overhead)
2. ✓ **Clear iterative structure** (easy to reason about)
3. ✓ **Can backtrack to find items** (not just the value)
4. ✓ **Same time complexity** as memoization (O(n × capacity))
5. ⚠️ **Still uses O(n × capacity) space** (but we can optimize this!)

---

## What's Next?

Our tabulation solution uses O(n × capacity) space for the full 2D table. But notice something: when computing `dp[i][w]`, we only need values from `dp[i-1][...]` (the previous row).

**Can we use just two rows instead of n rows?**  
**Or even just one row?**

In the next section, we'll explore **space optimization** techniques that reduce memory usage from O(n × capacity) to O(capacity)!

---

## Try It Yourself

1. Print the full DP table for our example — see the pattern?
2. Modify the code to handle zero or negative capacities
3. What happens if all weights exceed capacity? Verify with the table.
