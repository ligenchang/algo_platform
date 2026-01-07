# Knapsack Problem - Implementation

Use the provided `knapsack_starter.py` as the starting point. The dynamic programming implementation fills a table (or a 1D optimized array) to compute the best value for each capacity up to `knapsack_max_weight`.

Key points:

- Initialize an array `dp` of size `knapsack_max_weight + 1` with zeros.
- For each item `(wt, val)`, iterate `cap` from `knapsack_max_weight` down to `wt` and update `dp[cap] = max(dp[cap], dp[cap - wt] + val)`.
- Return `dp[knapsack_max_weight]` after processing all items.

Open `knapsack_starter.py` in the editor and implement or review the solution.
