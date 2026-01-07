"""
0/1 Knapsack Problem - Starter Code

Complete the functions below following the progression from the course:
1. Start with recursive solution
2. Add memoization
3. Implement tabulation
4. Optimize space

Each function should solve the same problem using different approaches.
"""

def knapsack_recursive(weights, values, n, capacity):
    """
    Solve using pure recursion.
    
    Args:
        weights: list of item weights
        values: list of item values
        n: number of items to consider (items 0 to n-1)
        capacity: remaining knapsack capacity
    
    Returns:
        Maximum value achievable
    
    TODO: Implement the recursive solution
    Hint: Base case: n==0 or capacity==0 → return 0
    Hint: If weights[n-1] > capacity, skip this item
    Hint: Otherwise, try both options (take/skip) and return max
    """
    # YOUR CODE HERE
    pass


def knapsack_memo(weights, values, n, capacity, memo=None):
    """
    Solve using memoization (top-down DP).
    
    Args:
        weights: list of item weights
        values: list of item values
        n: number of items to consider
        capacity: remaining capacity
        memo: dictionary to store computed results
    
    Returns:
        Maximum value achievable
    
    TODO: Implement memoization
    Hint: Initialize memo dict if None
    Hint: Check memo before computing
    Hint: Store result in memo before returning
    """
    # YOUR CODE HERE
    pass


def knapsack_tabulation(weights, values, capacity):
    """
    Solve using tabulation (bottom-up DP).
    
    Args:
        weights: list of item weights
        values: list of item values
        capacity: knapsack capacity
    
    Returns:
        Maximum value achievable
    
    TODO: Implement tabulation with 2D table
    Hint: Create (n+1) x (capacity+1) table
    Hint: Fill row by row, using recurrence relation
    Hint: Return dp[n][capacity]
    """
    # YOUR CODE HERE
    pass


def knapsack_optimized(weights, values, capacity):
    """
    Solve using space-optimized 1D array.
    
    Args:
        weights: list of item weights
        values: list of item values
        capacity: knapsack capacity
    
    Returns:
        Maximum value achievable
    
    TODO: Implement space-optimized solution
    Hint: Use single 1D array
    Hint: Iterate through capacities RIGHT-TO-LEFT
    Hint: Update dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    """
    # YOUR CODE HERE
    pass


def knapsack_with_items(weights, values, capacity):
    """
    Solve and return both max value and selected items.
    
    Args:
        weights: list of item weights
        values: list of item values
        capacity: knapsack capacity
    
    Returns:
        Tuple of (max_value, list of selected item indices)
    
    TODO: Implement with item tracking
    Hint: Use 2D table for DP
    Hint: Backtrack from dp[n][capacity] to find selected items
    """
    # YOUR CODE HERE
    pass


# ==================== TESTING ====================

def test_all_solutions():
    """Test all implementations with the same examples."""
    
    # Example 1: Small example from course
    weights1 = [1, 3, 4, 5]
    values1 = [15, 10, 30, 25]
    capacity1 = 7
    expected1 = 45  # Ring + Laptop
    
    print("Example 1: capacity=7")
    print(f"  Weights: {weights1}")
    print(f"  Values:  {values1}")
    print(f"  Expected: {expected1}")
    
    # Test recursive
    result = knapsack_recursive(weights1, values1, len(weights1), capacity1)
    print(f"  Recursive:  {result} {'✓' if result == expected1 else '✗'}")
    
    # Test memoization
    result = knapsack_memo(weights1, values1, len(weights1), capacity1)
    print(f"  Memoization: {result} {'✓' if result == expected1 else '✗'}")
    
    # Test tabulation
    result = knapsack_tabulation(weights1, values1, capacity1)
    print(f"  Tabulation: {result} {'✓' if result == expected1 else '✗'}")
    
    # Test optimized
    result = knapsack_optimized(weights1, values1, capacity1)
    print(f"  Optimized:  {result} {'✓' if result == expected1 else '✗'}")
    
    print()
    
    # Example 2: Another test case
    weights2 = [2, 3, 4, 5]
    values2 = [3, 4, 5, 8]
    capacity2 = 5
    expected2 = 8  # Just item with weight=5, value=8
    
    print("Example 2: capacity=5")
    print(f"  Weights: {weights2}")
    print(f"  Values:  {values2}")
    print(f"  Expected: {expected2}")
    
    result = knapsack_recursive(weights2, values2, len(weights2), capacity2)
    print(f"  Recursive:  {result} {'✓' if result == expected2 else '✗'}")
    
    result = knapsack_memo(weights2, values2, len(weights2), capacity2)
    print(f"  Memoization: {result} {'✓' if result == expected2 else '✗'}")
    
    result = knapsack_tabulation(weights2, values2, capacity2)
    print(f"  Tabulation: {result} {'✓' if result == expected2 else '✗'}")
    
    result = knapsack_optimized(weights2, values2, capacity2)
    print(f"  Optimized:  {result} {'✓' if result == expected2 else '✗'}")
    
    print()
    
    # Example 3: Test with item tracking
    print("Example 3: With item tracking")
    max_value, selected = knapsack_with_items(weights1, values1, capacity1)
    print(f"  Max value: {max_value}")
    print(f"  Selected items: {selected}")
    if selected:
        print(f"  Items: ", end="")
        for idx in selected:
            print(f"(w={weights1[idx]}, v={values1[idx]}) ", end="")
        print()


if __name__ == '__main__':
    print("=" * 50)
    print("0/1 Knapsack Problem - Testing All Approaches")
    print("=" * 50)
    print()
    test_all_solutions()

