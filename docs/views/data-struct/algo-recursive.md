---
title: 递归和斐波那契数列
date: 2022-05-28 15:39:15
category: DataStruct
tag:
    - recursive
---

## 递归和斐波那契数列

```c
//
// Created by virus on 2022/5/28.
//

#include <stdio.h>

unsigned int Factorial(unsigned int n) {
    if (n == 0) {
        return 1;
    } else {
        return n * Factorial(n - 1);
    }
}

unsigned int FactorialByIteration(unsigned int n) {
    unsigned int result = 1;
    unsigned int i = n;
    for (; i > 0; i--) {
        result *= i;
    }
    return result;
}

unsigned int Fibonacci(unsigned int n) {
    if (n == 1 || n == 0) {
        return n;
    } else {
        return Fibonacci(n - 1) + Fibonacci(n - 2);
    }
}

unsigned int FibonacciByIteration(unsigned int n) {
    if (n == 1 || n == 0) {
        return n;
    }
    unsigned int last = 0;
    unsigned int current = 1;
    for (int i = 0; i <= n - 2; i++) {
        unsigned int temp = current;
        current += last;
        last = temp;
    }
    return current;
}

int main(void) {
    printf("3! = %d\n", Factorial(3));
    printf("4! = %d\n", Factorial(4));
    printf("4! = %d\n", FactorialByIteration(4));
    printf("Fibonacci(4) = %d\n", Fibonacci(4));
    printf("Fibonacci(4) = %d\n", FibonacciByIteration(4));
}
```
