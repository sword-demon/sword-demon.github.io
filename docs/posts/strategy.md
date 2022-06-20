---
title: 策略模式
date: 2021-11-30 18:37:15
category: Note
tag:
    - designer
---

## 引入

> 假设一开始我们对一个`int`数组进行排序

```java
public class Sorter {

    /**
     * 选择排序
     * @param arr int[]
     */
    public static void sort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minPos = i;

            for (int j = i + 1; j < arr.length; j++) {
                minPos = arr[j] < arr[minPos] ? j : minPos;
            }

            swap(arr, i, minPos);
        }
    }

    // 进行交换
    static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

```

```java
public class Main {
    public static void main(String[] args) {
        int[] arr = new int[]{12, 22, 1121, 12};

        Sorter.sort(arr);
        System.out.println(Arrays.toString(arr));
    }
}
```

:::warning

但是，此时此刻，我们又需要进行`double`类型的数组进行排序。再写一个排序类么？但是如果不是一个可以进行数值比较的类型呢，如果是自定义的数据类型呢？**就需要去实现`compareTo`方法**

:::

```java
public class Cat {
    int weight, height;

    public Cat(int weight, int height) {
        this.weight = weight;
        this.height = height;
    }

    public int compareTo(Cat c) {
        if (this.weight < c.weight) return -1;
        else if (this.weight > c.weight) return 1;
        else return 0;
    }
}
```

```java
public class Sorter {

    /**
     * 选择排序
     * @param arr int[]
     */
    public static void sort(Cat[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minPos = i;

            for (int j = i + 1; j < arr.length; j++) {
                minPos = arr[j].compareTo(arr[minPos]) == -1 ? j : minPos;
            }

            swap(arr, i, minPos);
        }
    }

    // 别的 sort(int[]) sort(double[]) ...

    static void swap(Cat[] arr, int i, int j) {
        Cat temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
//        int[] arr = new int[]{12, 22, 1121, 12};

        Cat[] arr = {new Cat(3, 3), new Cat(5, 5), new Cat(2, 2)};

        Sorter.sort(arr);
        System.out.println(Arrays.toString(arr));
    }
}
```

```bash
[Cat{weight=2, height=2}, Cat{weight=3, height=3}, Cat{weight=5, height=5}]
```

长此以往，有更多的类型，进行排序，把类型换成`Object[]`？，但是它没有`compareTo`方法。所以我们换成`Comparable[]`类型，它里面有`compareTo`方法。

改进写法：

```java
public interface MyComparable {
    int compareTo(Object o);
}


public class Sorter {

    /**
     * 选择排序
     * @param arr int[]
     */
    public static void sort(MyComparable[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minPos = i;

            for (int j = i + 1; j < arr.length; j++) {
                minPos = arr[j].compareTo(arr[minPos]) == -1 ? j : minPos;
            }

            swap(arr, i, minPos);
        }
    }

    static void swap(MyComparable[] arr, int i, int j) {
        MyComparable temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

```java
package com.wxvirus.strategy;

public class Dog implements MyComparable {

    int food;

    public Dog(int food) {
        this.food = food;
    }

    @Override
    public int compareTo(Object o) {
        Dog d = (Dog) o;
        if (this.food < d.food) return -1;
        else if (this.food > d.food) return 1;
        else return 0;
    }

    @Override
    public String toString() {
        return "Dog{" +
                "food=" + food +
                '}';
    }
}

```

:::warning

但是呢，这个里面进行验证的时候传值的都要强制转换类型，加入你传的不是对应的一个类型，怎么办，就会直接报异常！所以针对于此，使用泛型来解决。

:::

改进代码：

```java
package com.wxvirus.strategy;

// 谁用我的接口，指定什么类型
public interface MyComparable<T> {
    int compareTo(T o);
}
```

```java
package com.wxvirus.strategy;

// 指定Dog类
public class Dog implements MyComparable<Dog> {

    int food;

    public Dog(int food) {
        this.food = food;
    }

    @Override
    public int compareTo(Dog d) {
        // 少了一个强转的步骤
        if (this.food < d.food) return -1;
        else if (this.food > d.food) return 1;
        else return 0;
    }

    @Override
    public String toString() {
        return "Dog{" +
                "food=" + food +
                '}';
    }
}

```

---

> 由于 Cat 实现了`MyComparable`接口，假如现在不想比较猫的`weight`，想比较猫的`height`，甚至可能不止与这一种，想要灵活的进行比较，该如何实现？

> **编程里有一种原则：对扩展开放，对修改关闭，叫开闭原则。** --《设计模式》

> 所以我们尽量不去修改原先的比较代码，进行扩展。

加入一个比较器

```java
package com.wxvirus.strategy;

// 实现自己的比较器
public interface MyComparator<T> {
    int compare(T o1, T o2);
}
```

```java
public class Sorter<T> {

    /**
     * 选择排序
     * @param arr int[]
     */
    public void sort(T[] arr, MyComparator<T> comparator) {
        for (int i = 0; i < arr.length - 1; i++) {
            int minPos = i;

            for (int j = i + 1; j < arr.length; j++) {
                minPos = comparator.compare(arr[j], arr[minPos]) == -1 ? j : minPos;
            }

            swap(arr, i, minPos);
        }
    }

    void swap(T[] arr, int i, int j) {
        T temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

```

```java
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        Sorter<Dog> sorter = new Sorter<>();
        Dog[] brr = {new Dog(5), new Dog(1)};
        // 后面的为排序策略
        sorter.sort(brr, new MyComparator<Dog>() {
            @Override
            public int compare(Dog o1, Dog o2) {
                // 如果狗有别的属性，还可以实现别的比较器进行比较
                return o1.food - o2.food;
            }
        });
        System.out.println(Arrays.toString(brr));
    }
}
```

:::tip

意思即：你可以传入任意类型的数组，可以对任意类型的数组，去定义一个排序的策略。

:::
