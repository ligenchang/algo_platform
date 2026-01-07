# 1. Understanding the 0/1 Knapsack Problem

## The Scenario

Imagine you're a thief breaking into a house. You have a backpack (knapsack) that can carry a maximum weight, and the house has various items with different weights and values. **Your goal: maximize the total value of items you steal without exceeding your backpack's capacity.**

The catch? This is the **0/1 Knapsack Problem**, meaning for each item, you can either:
- **Take it (1)**, or
- **Leave it (0)**

You cannot take a fraction of an item or take the same item multiple times.

---

## A Concrete Example

Let's say your backpack can carry **7 kg** maximum. The house has these items:

| Item | Weight (kg) | Value ($) |
|------|-------------|-----------|
| 💍 Diamond Ring | 1 | 15 |
| 📷 Camera | 3 | 10 |
| 💻 Laptop | 4 | 30 |
| 🎮 Game Console | 5 | 25 |

**Question:** Which items should you take to maximize value while staying within 7 kg?

### Let's think through some options:

1. **Take everything?**  
   Total weight: 1 + 3 + 4 + 5 = 13 kg ❌ (exceeds capacity)

2. **Take the most valuable item (Laptop)?**  
   Weight: 4 kg, Value: $30 ✓ (fits)  
   But wait, we still have 3 kg left...

3. **Take Laptop + Ring?**  
   Weight: 4 + 1 = 5 kg, Value: $30 + $15 = $45 ✓ (fits)  
   Still 2 kg left...

4. **Take Laptop + Camera?**  
   Weight: 4 + 3 = 7 kg, Value: $30 + $10 = $40 ✓ (fits perfectly!)

5. **Take Game Console + Ring?**  
   Weight: 5 + 1 = 6 kg, Value: $25 + $15 = $40 ✓ (fits)

**The optimal solution:** Laptop + Ring = **$45** (within 7 kg capacity)

---

## Why Is This Problem Hard?

With 4 items, we could check all combinations manually. But what if we had **100 items**? That's 2^100 possible combinations (over a nonillion possibilities!).

We need a smarter approach than checking every combination. This is where **Dynamic Programming** comes in.

But before jumping to DP, we'll start with the most intuitive solution: **recursion**. This will help us understand the problem structure before optimizing.

---

## Key Concepts to Remember

1. **Choice:** For each item, we decide: take it or leave it
2. **Constraint:** Total weight cannot exceed capacity
3. **Objective:** Maximize total value
4. **0/1 Rule:** Each item can only be used once (no splitting or repeating)

In the next section, we'll write a recursive solution that mirrors how we naturally think about this problem.
