# Knapsack Problem

Now that you saw the dynamic programming solution for the knapsack problem, it's time to implement it. Assume you are given two things:

- The items, each having its associated weight (kg) and value ($).
- A knapsack that can hold a maximum weight of `knapsack_max_weight` (kg).

Use dynamic programming to implement the function `knapsack_max_value(items, knapsack_max_weight)` to return the maximum total value of items that can be accommodated into the given knapsack. Each item is a tuple `(weight, value)` and you may choose to take an item at most once.

Example:

Input:

items = [(2, 3), (3, 4), (4, 5), (5, 8)]
knapsack_max_weight = 5

Output: 8  # take item with weight=5 value=8 (or items 2+3 -> 3+4 = 7 is less)

Constraints:

- Use 0/1 knapsack dynamic programming (no fractional items).
- Time complexity should be O(n * W) where n is number of items and W is knapsack_max_weight.

Starter instructions:

Implement `knapsack_max_value(items, knapsack_max_weight)` and ensure it returns an integer representing the maximum total value.
