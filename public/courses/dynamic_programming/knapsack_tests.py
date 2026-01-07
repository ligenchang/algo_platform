def run_tests(knapsack_func):
    tests = []
    tests.append((([(2,3),(3,4),(4,5),(5,8)], 5), 8))
    tests.append((([], 10), 0))
    tests.append((([(1,1),(1,2),(1,3)], 2), 5))
    tests.append((([(10,100),(20,200)], 5), 0))

    results = []
    for inp, expected in tests:
        try:
            out = knapsack_func(inp[0], inp[1])
            results.append((out == expected, out, expected))
        except Exception as e:
            results.append((False, f'error: {e}', expected))

    return results

if __name__ == '__main__':
    # simple self-run example
    from knapsack_starter import knapsack_max_value
    print(run_tests(knapsack_max_value))
