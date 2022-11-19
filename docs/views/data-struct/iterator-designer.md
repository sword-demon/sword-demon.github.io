---
title: Iterator 模式
date: 2022-11-19 21:45:10
category: DataStruct
tag:
    - designer
---

# Iterator 模式

> 一般用于多数据遍历。
>
> 在使用 Java 语言显示数组`arr`元素时，我们大部分时候使用`for`循环遍历数组
>
> ```java
> for (int i = 0; i < arr.length; i++) {
>    System.out.printlne(arr[i]);
> }
> ```
>
> 将这里的循环变量`i`的作用抽象化、通用化后形成的模式，在设计模式中成为`Iterator`模式。`Iterator`模式用于在数据集合中按照顺序遍历集合。

## Demo：将书(Book)放置到书架(BookShelf)中，并将书的名字按顺序显示出来

`Aggregate`接口：是所要遍历的集合的接口。实现了该接口的类将成为一个可以保存多个元素的集合。

![image-20221105204942011](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20221105204942011.png)

```java
package demo.bookself;

/**
 * 表示集合的接口
 */
public interface Aggregate {
    public abstract WxIterator iterator();
}

```

这个接口中声明的方法只有一个`iterator`的方法，该方法会生成一个用于遍历集合的迭代器。**这里我修改了一个迭代器接口的名称为`WxIterator`用于区分和`java`已有的**

```java
package demo.bookself;

/**
 * 表示遍历集合的接口
 */
public interface WxIterator {
    /**
     * 判断是否有下一个元素
     * 主要用于终止循环
     * @return boolean
     */
    public abstract boolean hasNext();

    /**
     * 获取下一个元素
     * 包含迭代器移动至下一个元素的位置
     * @return Object
     */
    public abstract Object next();
}

```

`WxIterator`相当于上面`for`循环的循环变量，我们定义 2 个方法

-   判断是否有下一个元素

    > 这个方法的返回值是`boolean`,当集合中存在下一个元素时，返回`true`；当集合中不存在下一个元素时，即已经遍历至集合末尾时，该方法返回`false`；`hasNext`方法主要用于循环终止条件。

-   获取下一个元素，并将迭代器移动到下一个位置。

## 迭代器接口

```java
package demo.bookself;

/**
 * 表示遍历集合的接口
 */
public interface WxIterator {
    /**
     * 判断是否有下一个元素
     * 主要用于终止循环
     * @return boolean
     */
    public abstract boolean hasNext();

    /**
     * 获取下一个元素
     * 包含迭代器移动至下一个元素的位置
     * @return Object
     */
    public abstract Object next();
}

```

## 书架类和书实体类

```java
package demo.bookself;

/**
 * 书的实体类
 */
public class Book {
    private String name;

    public Book(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

```

```java
package demo.bookself;

/**
 * 表示书架的类
 */
public class BookSelf implements Aggregate {

    private Book[] books;
    private int last = 0;

    public BookSelf(int maxsize) {
        this.books = new Book[maxsize];
    }

    public Book getBookAt(int index) {
        return books[index];
    }

    public void appendBook(Book book) {
        this.books[last] = book;
        last++;
    }

    public int getLength() {
        return last;
    }

    @Override
    public WxIterator iterator() {
        return new BookSelfIterator(this);
    }
}

```

## 实现`WxIterator`的方法

```java
package demo.bookself;

/**
 * 遍历书架的类
 */
public class BookSelfIterator implements WxIterator {
    private BookSelf bookSelf;
    private int index;

    public BookSelfIterator(BookSelf bookSelf) {
        this.bookSelf = bookSelf;
        this.index = 0;
    }

    /**
     * 判断是否有下一个元素
     * 主要用于终止循环
     *
     * @return boolean
     */
    @Override
    public boolean hasNext() {
        return index < bookSelf.getLength();
    }

    /**
     * 获取下一个元素
     * 包含迭代器移动至下一个元素的位置
     *
     * @return Object
     */
    @Override
    public Object next() {
        Book book = bookSelf.getBookAt(index);
        index++;
        return book;
    }
}

```

## 测试类

```java
package demo.bookself;

public class Main {
    public static void main(String[] args) {
        BookSelf bookSelf = new BookSelf(4);
        bookSelf.appendBook(new Book("Around the world in 80 days"));
        bookSelf.appendBook(new Book("Bible"));
        bookSelf.appendBook(new Book("Cinderella"));
        bookSelf.appendBook(new Book("Daddy-Long-Legs"));
        WxIterator it = bookSelf.iterator();
        while (it.hasNext()) {
            Book book = (Book) it.next();
            System.out.println(book.getName());
        }
    }
}

```
