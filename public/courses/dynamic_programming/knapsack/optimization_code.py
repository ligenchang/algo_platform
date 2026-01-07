"""
Section 5: Space Optimization
===============================

Optimize space complexity from O(n × capacity) to O(capacity).
"""

def knapsack_optimized(weights, values, capacity):
    """
    Space-optimized with single array: O(capacity)
    
    Key insight: Process capacities from RIGHT to LEFT
    so we don't overwrite values we still need.
    """
    n = len(weights)
    
    # TODO: Create single 1D array
    # dp = [0] * (capacity + 1)
    
    # TODO: Process each item
    # for i in range(n):
    #     # CRITICAL: Iterate from right to left!
    #     for w in range(capacity, weights[i] - 1, -1):
    #         # Take item i or don't take it
    #         dp[w] = max(
    #             dp[w],                           # don't take
    #             values[i] + dp[w - weights[i]]   # take
    #         )
    
    # TODO: Return dp[capacity]
    
    pass  # Remove this and implement


def knapsack_two_rows(weights, values, capacity):
    """
    Alternative: Space-optimized with two rows: O(2 × capacity) = O(capacity)
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


# Test both optimization approaches
if __name__ == '__main__':
    weights = [1, 3, 4, 5]
    values = [15, 10, 30, 25]
    capacity = 7
    
    result = knapsack_optimized(weights, values, capacity)
    print(f"Maximum value (1D optimized): ${result}")
    print(f"Expected: $45")
    
    result2 = knapsack_two_rows(weights, values, capacity)
    print(f"Maximum value (2-row optimized): ${result2}")
    print(f"Expected: $45")
    
    # Test with larger example to see space benefit
    import random
    random.seed(42)
    n_items = 100
    large_weights = [random.randint(1, 20) for _ in range(n_items)]
    large_values = [random.randint(10, 100) for _ in range(n_items)]
    large_capacity = 500
    
    result_large = knapsack_optimized(large_weights, large_values, large_capacity)
    print(f"\nLarge example (100 items, capacity 500): ${result_large}")
    print("Space used: O(500) instead of O(100 × 500) = 50,000!")
