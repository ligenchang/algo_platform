"""
Section 2: Recursive Solution
===============================

Implement the recursive solution for the knapsack problem.
"""

def knapsack_recursive(weights, values, n, capacity):
    """
    Solve 0/1 Knapsack using pure recursion.
    
    Args:
        weights: list of item weights
        values: list of item values
        n: number of items to consider (items 0 to n-1)
        capacity: remaining knapsack capacity
    
    Returns:
        Maximum value achievable
    """
    # TODO: Implement the base cases
    # Base case 1: No items left (n == 0)
    # Base case 2: No capacity left (capacity == 0)
    
    # TODO: If current item is too heavy, skip it
    # if weights[n-1] > capacity:
    #     return ...
    
    # TODO: Try both options and return the maximum
    # Option 1: Don't take item n-1
    # exclude = ...
    
    # Option 2: Take item n-1
    # include = ...
    
    # return max(exclude, include)
    
    pass  # Remove this and implement


# Test the recursive solution
if __name__ == '__main__':
    weights = [1, 3, 4, 5]
    values = [15, 10, 30, 25]
    capacity = 7
    n = len(weights)
    
    result = knapsack_recursive(weights, values, n, capacity)
    print(f"Maximum value (recursive): ${result}")
    print(f"Expected: $45")
    
    # Try with another example
    weights2 = [2, 3, 4, 5]
    values2 = [3, 4, 5, 8]
    capacity2 = 5
    n2 = len(weights2)
    
    result2 = knapsack_recursive(weights2, values2, n2, capacity2)
    print(f"\nMaximum value (example 2): ${result2}")
    print(f"Expected: $8")
