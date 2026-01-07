"""
Test suite for 0/1 Knapsack Problem

This module provides comprehensive tests for all knapsack implementations.
Import your solution functions and run the tests to verify correctness.
"""

def run_tests(knapsack_func):
    """
    Run test cases on a knapsack function.
    
    Args:
        knapsack_func: Function with signature (weights, values, capacity) -> max_value
    
    Returns:
        List of tuples: (passed, actual_output, expected_output)
    """
    tests = []
    
    # Test 1: Basic example
    tests.append({
        'weights': [2, 3, 4, 5],
        'values': [3, 4, 5, 8],
        'capacity': 5,
        'expected': 8,
        'description': 'Basic: one heavy item is optimal'
    })
    
    # Test 2: Empty knapsack
    tests.append({
        'weights': [],
        'values': [],
        'capacity': 10,
        'expected': 0,
        'description': 'Edge case: no items'
    })
    
    # Test 3: Multiple light items
    tests.append({
        'weights': [1, 1, 1],
        'values': [1, 2, 3],
        'capacity': 2,
        'expected': 5,
        'description': 'Multiple items: take two best'
    })
    
    # Test 4: All items too heavy
    tests.append({
        'weights': [10, 20],
        'values': [100, 200],
        'capacity': 5,
        'expected': 0,
        'description': 'Edge case: all items too heavy'
    })
    
    # Test 5: Course example (Ring + Laptop)
    tests.append({
        'weights': [1, 3, 4, 5],
        'values': [15, 10, 30, 25],
        'capacity': 7,
        'expected': 45,
        'description': 'Course example: Ring + Laptop = 45'
    })
    
    # Test 6: Zero capacity
    tests.append({
        'weights': [1, 2, 3],
        'values': [10, 20, 30],
        'capacity': 0,
        'expected': 0,
        'description': 'Edge case: zero capacity'
    })
    
    # Test 7: Exact fit
    tests.append({
        'weights': [2, 3, 5],
        'values': [10, 15, 25],
        'capacity': 5,
        'expected': 25,
        'description': 'Exact fit: single item fills capacity'
    })
    
    # Test 8: Multiple items fit perfectly
    tests.append({
        'weights': [1, 2, 3],
        'values': [6, 10, 12],
        'capacity': 6,
        'expected': 22,
        'description': 'Perfect fit: all items combined'
    })
    
    results = []
    for i, test in enumerate(tests, 1):
        try:
            # Handle different function signatures
            # Try (weights, values, capacity) first
            try:
                actual = knapsack_func(test['weights'], test['values'], test['capacity'])
            except TypeError:
                # Try (weights, values, n, capacity) for recursive/memo versions
                n = len(test['weights'])
                actual = knapsack_func(test['weights'], test['values'], n, test['capacity'])
            
            passed = (actual == test['expected'])
            results.append({
                'test_num': i,
                'description': test['description'],
                'passed': passed,
                'actual': actual,
                'expected': test['expected'],
                'weights': test['weights'],
                'values': test['values'],
                'capacity': test['capacity']
            })
        except Exception as e:
            results.append({
                'test_num': i,
                'description': test['description'],
                'passed': False,
                'actual': f'ERROR: {str(e)}',
                'expected': test['expected'],
                'weights': test['weights'],
                'values': test['values'],
                'capacity': test['capacity']
            })
    
    return results


def print_results(results):
    """Pretty print test results."""
    print("\n" + "=" * 70)
    print("TEST RESULTS")
    print("=" * 70)
    
    passed = sum(1 for r in results if r['passed'])
    total = len(results)
    
    for result in results:
        status = "✓ PASS" if result['passed'] else "✗ FAIL"
        print(f"\nTest {result['test_num']}: {status}")
        print(f"  {result['description']}")
        print(f"  Weights:  {result['weights']}")
        print(f"  Values:   {result['values']}")
        print(f"  Capacity: {result['capacity']}")
        print(f"  Expected: {result['expected']}")
        print(f"  Actual:   {result['actual']}")
    
    print("\n" + "=" * 70)
    print(f"SUMMARY: {passed}/{total} tests passed")
    if passed == total:
        print("🎉 All tests passed! Great job!")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Keep debugging!")
    print("=" * 70 + "\n")


def test_with_items_function(knapsack_with_items_func):
    """
    Test the version that returns both value and selected items.
    
    Args:
        knapsack_with_items_func: Function with signature 
            (weights, values, capacity) -> (max_value, selected_items)
    """
    print("\n" + "=" * 70)
    print("TESTING WITH ITEM TRACKING")
    print("=" * 70)
    
    weights = [1, 3, 4, 5]
    values = [15, 10, 30, 25]
    capacity = 7
    
    max_value, selected = knapsack_with_items_func(weights, values, capacity)
    
    print(f"\nWeights:  {weights}")
    print(f"Values:   {values}")
    print(f"Capacity: {capacity}")
    print(f"\nMax Value: {max_value}")
    print(f"Selected Items: {selected}")
    
    # Verify the selection
    total_weight = sum(weights[i] for i in selected)
    total_value = sum(values[i] for i in selected)
    
    print(f"\nVerification:")
    print(f"  Total weight: {total_weight} (capacity: {capacity})")
    print(f"  Total value:  {total_value} (max: {max_value})")
    
    if total_weight <= capacity and total_value == max_value:
        print("✓ Valid selection!")
    else:
        print("✗ Invalid selection!")
    
    print(f"\nSelected item details:")
    for idx in selected:
        print(f"  Item {idx}: weight={weights[idx]}, value={values[idx]}")
    
    print("=" * 70 + "\n")


if __name__ == '__main__':
    print("\n" + "!" * 70)
    print("To test your solution, import your function and call run_tests()")
    print("!" * 70)
    print("\nExample usage:")
    print("  from knapsack_starter import knapsack_recursive")
    print("  results = run_tests(knapsack_recursive)")
    print("  print_results(results)")
    print("\n" + "!" * 70 + "\n")

