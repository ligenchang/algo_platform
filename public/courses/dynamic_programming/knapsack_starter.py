"""
Knapsack starter code

Implement knapsack_max_value(items, knapsack_max_weight)
items: list of tuples (weight:int, value:int)
knapsack_max_weight: int
Return: int (maximum total value)
"""

def knapsack_max_value(items, knapsack_max_weight):
    # TODO: implement dynamic programming solution
    # This is a placeholder naive implementation — replace with DP
    n = len(items)
    dp = [[0] * (knapsack_max_weight + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        w, v = items[i - 1]
        for cap in range(knapsack_max_weight + 1):
            if w <= cap:
                dp[i][cap] = max(dp[i - 1][cap], dp[i - 1][cap - w] + v)
            else:
                dp[i][cap] = dp[i - 1][cap]

    return dp[n][knapsack_max_weight]


if __name__ == '__main__':
    # simple test
    items = [(2, 3), (3, 4), (4, 5), (5, 8)]
    print(knapsack_max_value(items, 5))  # expected 8
