# Knapsack Problem - Analysis

The 0/1 knapsack can be solved with dynamic programming. Let `dp[i][w]` represent the maximum value achievable using the first `i` items with a capacity limit `w`.

Recurrence:

If the i-th item has weight `wt` and value `val`:

- If `wt > w`: `dp[i][w] = dp[i-1][w]` (can't include the item)
- Else: `dp[i][w] = max(dp[i-1][w], dp[i-1][w-wt] + val)`

We can optimize space to a 1D array `dp[w]` iterating items and capacities in reverse.

Time complexity: O(n * W)
Space complexity: O(W)
