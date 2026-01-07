"""
Section 3: Memoization (Top-Down DP)
=====================================

Add memoization to the recursive solution to eliminate redundant computation.
"""

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
    # TODO: Initialize memo on first call
    # if memo is None:
    #     memo = {}
    
    # TODO: Check if we've already solved this subproblem
    # if (n, capacity) in memo:
    #     return memo[(n, capacity)]
    
    # TODO: Base cases (same as recursive)
    
    # TODO: If current item is too heavy, skip it
    
    # TODO: Try both options and pick the best
    
    # TODO: Store result in memo before returning
    # memo[(n, capacity)] = result
    # return result
    
    pass  # Remove this and implement


# Test the memoized solution
if __name__ == '__main__':
    weights = [1, 3, 4, 5]
    values = [15, 10, 30, 25]
    capacity = 7
    n = len(weights)
    
    result = knapsack_memo(weights, values, n, capacity)
    print(f"Maximum value (memoized): ${result}")
    print(f"Expected: $45")
    
    # Test with larger example (would be slow with pure recursion)
    import random
    random.seed(42)
    n_items = 20
    large_weights = [random.randint(1, 10) for _ in range(n_items)]
    large_values = [random.randint(10, 50) for _ in range(n_items)]
    large_capacity = 50
    
    result_large = knapsack_memo(large_weights, large_values, n_items, large_capacity)
    print(f"\nLarge example (20 items, capacity 50): ${result_large}")
    print("This would be too slow with pure recursion!")
