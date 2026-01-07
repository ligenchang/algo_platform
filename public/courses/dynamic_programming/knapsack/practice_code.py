"""
Section 6: Practice Problems
==============================

Try implementing solutions to these knapsack variations!
"""

def subset_sum(nums, target):
    """
    Problem 1: Subset Sum
    
    Given a set of numbers and a target, determine if any subset
    sums to the target.
    
    Example:
        nums = [3, 34, 4, 12, 5, 2]
        target = 9
        Answer: True (4 + 5 = 9)
    
    TODO: Implement using DP (hint: similar to knapsack)
    """
    # dp = [False] * (target + 1)
    # dp[0] = True  # Empty subset sums to 0
    # 
    # for num in nums:
    #     # Right-to-left to avoid reusing same element
    #     for s in range(target, num - 1, -1):
    #         if dp[s - num]:
    #             dp[s] = True
    # 
    # return dp[target]
    
    pass  # Remove and implement


def can_partition(nums):
    """
    Problem 2: Partition Equal Subset Sum
    
    Determine if array can be partitioned into two equal-sum subsets.
    
    Example:
        nums = [1, 5, 11, 5]
        Answer: True ([1,5,5] and [11] both sum to 11)
    
    TODO: Implement
    Hint: If total sum is S, find subset that sums to S/2
    """
    pass  # Remove and implement


def count_subsets(nums, target):
    """
    Problem 3: Count of Subset Sum
    
    Count how many subsets sum to the target.
    
    Example:
        nums = [1, 1, 2, 3]
        target = 4
        Answer: 3 (subsets: [1,3], [1,3], [1,1,2])
    
    TODO: Implement
    Hint: Instead of boolean, track count
    """
    pass  # Remove and implement


def unbounded_knapsack(weights, values, capacity):
    """
    Problem 6: Unbounded Knapsack
    
    Same as 0/1 Knapsack, but you can take each item unlimited times.
    
    Example:
        weights = [1, 3, 4]
        values = [15, 50, 60]
        capacity = 8
        Answer: 120 (take item 2 twice: 60 + 60)
    
    TODO: Implement
    Hint: Iterate LEFT-TO-RIGHT instead of right-to-left!
    """
    pass  # Remove and implement


# Test your implementations
if __name__ == '__main__':
    print("Problem 1: Subset Sum")
    result1 = subset_sum([3, 34, 4, 12, 5, 2], 9)
    print(f"  Result: {result1}, Expected: True")
    
    print("\nProblem 2: Partition Equal Subset Sum")
    result2 = can_partition([1, 5, 11, 5])
    print(f"  Result: {result2}, Expected: True")
    
    print("\nProblem 3: Count Subsets")
    result3 = count_subsets([1, 1, 2, 3], 4)
    print(f"  Result: {result3}, Expected: 3")
    
    print("\nProblem 6: Unbounded Knapsack")
    result6 = unbounded_knapsack([1, 3, 4], [15, 50, 60], 8)
    print(f"  Result: {result6}, Expected: 120")
    
    print("\n--- Try implementing the solutions above! ---")
