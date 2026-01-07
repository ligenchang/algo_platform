"""
Section 1: Problem Introduction
================================

In this section, we're just understanding the problem. No code to write yet!

Below is a simple example showing what the knapsack problem looks like:
"""

# Example: Items with (weight, value)
items = [
    ("Diamond Ring", 1, 15),
    ("Camera", 3, 10),
    ("Laptop", 4, 30),
    ("Game Console", 5, 25)
]

capacity = 7

# Question: Which items should we take to maximize value?
# Expected answer: Ring + Laptop = $45

print("Items available:")
for name, weight, value in items:
    print(f"  {name}: weight={weight}kg, value=${value}")

print(f"\nKnapsack capacity: {capacity}kg")
print("\nThink about:")
print("1. What combinations are possible?")
print("2. Which combination gives maximum value?")
print("3. How would you check all possibilities?")

# Try manually:
print("\n--- Manual Calculation Example ---")
print("Option 1: Take Laptop (4kg) + Ring (1kg) = 5kg, value = $45")
print("Option 2: Take Laptop (4kg) + Camera (3kg) = 7kg, value = $40")
print("Option 3: Take Console (5kg) + Ring (1kg) = 6kg, value = $40")
print("\nBest option: Ring + Laptop = $45!")
