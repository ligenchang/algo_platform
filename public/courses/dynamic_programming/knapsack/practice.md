# 6. Practice Problems & Variations

Congratulations! You've mastered the 0/1 Knapsack problem through four different approaches. Now let's apply these techniques to related problems.

---

## Problem 1: Subset Sum

**Problem:** Given a set of positive integers and a target sum, determine if there's a subset that adds up to exactly that sum.

**Example:**
```
nums = [3, 34, 4, 12, 5, 2]
target = 9

Answer: True (4 + 5 = 9)
```

### How is this related to Knapsack?

Think of each number as an item where:
- Weight = Value = the number itself
- Capacity = Target sum
- Goal: Can we fill the knapsack to **exactly** the capacity?

<details>
<summary>💡 Click to see the solution</summary>

```python
def subset_sum(nums, target):
    """
    Returns True if any subset sums to target.
    
    This is knapsack where weight = value!
    """
    dp = [False] * (target + 1)
    dp[0] = True  # Empty subset sums to 0
    
    for num in nums:
        # Right-to-left to avoid reusing same element
        for s in range(target, num - 1, -1):
            if dp[s - num]:
                dp[s] = True
    
    return dp[target]

# Test
print(subset_sum([3, 34, 4, 12, 5, 2], 9))  # True
print(subset_sum([3, 34, 4, 12, 5, 2], 30)) # False
```

**Time:** O(n × target), **Space:** O(target)

</details>

---

## Problem 2: Partition Equal Subset Sum

**Problem:** Given an array of positive integers, determine if you can partition it into two subsets with equal sum.

**Example:**
```
nums = [1, 5, 11, 5]

Answer: True 
Partition 1: [1, 5, 5] = 11
Partition 2: [11] = 11
```

### Hint
If the total sum is odd, it's impossible. If even, can you find a subset that sums to `total_sum / 2`?

<details>
<summary>💡 Click to see the solution</summary>

```python
def can_partition(nums):
    """
    Returns True if array can be partitioned into two equal-sum subsets.
    
    Strategy: If total sum is S, we need a subset summing to S/2.
    """
    total = sum(nums)
    
    # If odd sum, impossible to partition equally
    if total % 2 != 0:
        return False
    
    target = total // 2
    
    # Subset sum problem!
    dp = [False] * (target + 1)
    dp[0] = True
    
    for num in nums:
        for s in range(target, num - 1, -1):
            if dp[s - num]:
                dp[s] = True
    
    return dp[target]

# Test
print(can_partition([1, 5, 11, 5]))  # True
print(can_partition([1, 2, 3, 5]))   # False (sum=11, can't partition)
```

**Time:** O(n × sum), **Space:** O(sum)

</details>

---

## Problem 3: Count of Subset Sum

**Problem:** Given an array and a target sum, count how many subsets sum to the target.

**Example:**
```
nums = [1, 1, 2, 3]
target = 4

Answer: 3
Subsets: [1, 3], [1, 3], [1, 1, 2]
```

### How is this different?

Instead of tracking "possible or not" (boolean), track **count** (integer).

<details>
<summary>💡 Click to see the solution</summary>

```python
def count_subsets(nums, target):
    """
    Returns number of subsets that sum to target.
    
    dp[s] = number of ways to make sum s
    """
    dp = [0] * (target + 1)
    dp[0] = 1  # One way to make 0: empty set
    
    for num in nums:
        for s in range(target, num - 1, -1):
            dp[s] += dp[s - num]  # Add ways from including this number
    
    return dp[target]

# Test
print(count_subsets([1, 1, 2, 3], 4))  # 3
print(count_subsets([1, 2, 3], 4))     # 2 ([1,3] and [2,2] - wait, no [2,2]!)
```

**Time:** O(n × target), **Space:** O(target)

</details>

---

## Problem 4: Minimum Subset Sum Difference

**Problem:** Partition an array into two subsets such that the absolute difference of their sums is minimized.

**Example:**
```
nums = [1, 6, 11, 5]

Answer: 1
Partition 1: [1, 5, 6] = 12
Partition 2: [11] = 11
Difference: |12 - 11| = 1
```

### Approach

If total sum is S and one subset sums to X, the other sums to S-X.  
Difference = |X - (S-X)| = |2X - S|

We want to find X closest to S/2.

<details>
<summary>💡 Click to see the solution</summary>

```python
def min_subset_sum_diff(nums):
    """
    Returns minimum possible difference between two subset sums.
    
    Strategy: Find all possible subset sums up to total/2,
    then pick the largest one (closest to half).
    """
    total = sum(nums)
    target = total // 2
    
    # Find all possible sums up to target
    dp = [False] * (target + 1)
    dp[0] = True
    
    for num in nums:
        for s in range(target, num - 1, -1):
            if dp[s - num]:
                dp[s] = True
    
    # Find largest sum <= target that's achievable
    for s in range(target, -1, -1):
        if dp[s]:
            # One subset sums to s, other sums to (total - s)
            return abs(total - 2 * s)
    
    return total  # Shouldn't reach here

# Test
print(min_subset_sum_diff([1, 6, 11, 5]))  # 1
print(min_subset_sum_diff([1, 2, 7]))      # 4 (best: [7] vs [1,2])
```

**Time:** O(n × sum), **Space:** O(sum)

</details>

---

## Problem 5: Target Sum (LeetCode 494)

**Problem:** Given an array and a target, assign `+` or `-` to each number to reach the target. Count how many ways.

**Example:**
```
nums = [1, 1, 1, 1, 1]
target = 3

Answer: 5
Ways: +1+1+1+1-1 = 3
      +1+1+1-1+1 = 3
      +1+1-1+1+1 = 3
      +1-1+1+1+1 = 3
      -1+1+1+1+1 = 3
```

### Key Insight

If we assign `+` to subset P and `-` to subset N:
- sum(P) - sum(N) = target
- sum(P) + sum(N) = sum(nums)

Solving: sum(P) = (target + sum(nums)) / 2

So this becomes: **count subsets that sum to (target + sum(nums)) / 2**!

<details>
<summary>💡 Click to see the solution</summary>

```python
def find_target_sum_ways(nums, target):
    """
    Returns number of ways to assign +/- to reach target.
    
    Transform into: count subsets summing to (target + total) / 2
    """
    total = sum(nums)
    
    # Check if solution is possible
    if (target + total) % 2 != 0 or abs(target) > total:
        return 0
    
    subset_sum = (target + total) // 2
    
    # Count subsets with this sum
    dp = [0] * (subset_sum + 1)
    dp[0] = 1
    
    for num in nums:
        for s in range(subset_sum, num - 1, -1):
            dp[s] += dp[s - num]
    
    return dp[subset_sum]

# Test
print(find_target_sum_ways([1, 1, 1, 1, 1], 3))  # 5
print(find_target_sum_ways([1], 1))              # 1
```

**Time:** O(n × sum), **Space:** O(sum)

</details>

---

## Problem 6: Unbounded Knapsack

**Problem:** Same as 0/1 Knapsack, but you can take each item **unlimited times**.

**Example:**
```
weights = [1, 3, 4]
values = [15, 50, 60]
capacity = 8

Answer: 120 (take item 2 twice: 60 + 60)
```

### What Changes?

For 0/1 Knapsack, we iterate **right-to-left** to avoid reusing items.  
For Unbounded Knapsack, we iterate **left-to-right** to allow reusing items!

<details>
<summary>💡 Click to see the solution</summary>

```python
def unbounded_knapsack(weights, values, capacity):
    """
    Knapsack where each item can be used unlimited times.
    
    Key difference: iterate LEFT-TO-RIGHT (allows reuse)
    """
    dp = [0] * (capacity + 1)
    
    for i in range(len(weights)):
        # LEFT-TO-RIGHT! (allows using item multiple times)
        for w in range(weights[i], capacity + 1):
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]])
    
    return dp[capacity]

# Test
print(unbounded_knapsack([1, 3, 4], [15, 50, 60], 8))  # 120
```

**Time:** O(n × capacity), **Space:** O(capacity)

**Why left-to-right?** Because `dp[w - weights[i]]` might already include item `i`, and that's OK — we can reuse it!

</details>

---

## Summary: The Knapsack Family

| Problem | Type | DP Formula | Direction |
|---------|------|------------|-----------|
| 0/1 Knapsack | Value optimization | max(don't take, take) | Right-to-left |
| Subset Sum | Existence check | OR(don't take, take) | Right-to-left |
| Count Subsets | Count ways | sum(ways without, ways with) | Right-to-left |
| Unbounded Knapsack | Unlimited items | max(don't take, take) | **Left-to-right** |
| Partition Equal | Existence (half sum) | Subset sum with target=total/2 | Right-to-left |
| Target Sum | Count ways | Count subsets = (target+total)/2 | Right-to-left |

---

## Practice Strategy

1. **Identify the pattern:** Does it involve selecting items with constraints?
2. **Define the state:** What subproblems do we need to solve?
3. **Write the recurrence:** How do we combine subproblem solutions?
4. **Choose the approach:** 
   - Need items? Use 2D table
   - Only need value? Use 1D array
   - Natural recursion? Use memoization
5. **Optimize:** Can we reduce space? Do we need to iterate right-to-left?

---

## Challenge Yourself

Try solving these on your own:

1. **Coin Change:** Minimum coins to make a target amount (unbounded)
2. **Rod Cutting:** Maximize revenue by cutting a rod into pieces (unbounded)
3. **Longest Common Subsequence:** Find longest common subsequence of two strings (2D DP)
4. **Edit Distance:** Minimum edits to transform one string to another (2D DP)

Each of these uses similar DP techniques. Start with the recursive solution, then optimize!

---

## Final Thoughts

You've learned the complete progression:
1. ✓ Recursive (understand the structure)
2. ✓ Memoization (eliminate redundancy)
3. ✓ Tabulation (bottom-up iteration)
4. ✓ Space optimization (reduce memory)
5. ✓ Variations (apply to related problems)

This is the framework for mastering **any** dynamic programming problem. The knapsack problem is just the beginning — these patterns appear everywhere in algorithms and real-world optimization!

Happy coding! 🚀
