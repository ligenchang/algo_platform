"""
Section 4: Tabulation (Bottom-Up DP)
======================================

Implement the bottom-up tabulation approach using a 2D DP table.
"""

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
    
    # TODO: Create DP table: (n+1) x (capacity+1)
    # dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    # TODO: Fill the table bottom-up
    # for i in range(1, n + 1):
    #     for w in range(capacity + 1):
    #         # Option 1: Don't take item i-1
    #         dp[i][w] = ...
    #         
    #         # Option 2: Take item i-1 (if it fits)
    #         if weights[i-1] <= w:
    #             include_value = ...
    #             dp[i][w] = max(dp[i][w], include_value)
    
    # TODO: Return the bottom-right corner
    # return dp[n][capacity]
    
    pass  # Remove this and implement


def knapsack_with_items(weights, values, capacity):
    """
    Returns both max value and list of selected items.
    """
    n = len(weights)
    dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
    
    # Fill table (same as tabulation)
    for i in range(1, n + 1):
        for w in range(capacity + 1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                include_value = values[i-1] + dp[i-1][w - weights[i-1]]
                dp[i][w] = max(dp[i][w], include_value)
    
    # TODO: Backtrack to find which items were selected
    selected = []
    w = capacity
    for i in range(n, 0, -1):
        # If value changed, we took this item
        if dp[i][w] != dp[i-1][w]:
            selected.append(i-1)  # item index
            w -= weights[i-1]     # reduce remaining capacity
    
    selected.reverse()
    return dp[n][capacity], selected


# Test the tabulation solution
if __name__ == '__main__':
    weights = [1, 3, 4, 5]
    values = [15, 10, 30, 25]
    capacity = 7
    
    result = knapsack_tabulation(weights, values, capacity)
    print(f"Maximum value (tabulation): ${result}")
    print(f"Expected: $45")
    
    # Test with item tracking
    max_value, items = knapsack_with_items(weights, values, capacity)
    print(f"\nWith item tracking:")
    print(f"Maximum value: ${max_value}")
    print(f"Selected items: {items}")
    print(f"Item details:")
    for idx in items:
        print(f"  Item {idx}: weight={weights[idx]}, value=${values[idx]}")
