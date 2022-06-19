---
title: go面向对象(接口)
date: 2022-03-20 15:20:15
category: Go
---

## 面向对象

-   `Go`语言仅支持封装，不支持继承和多态
-   `Go`语言没有`class`，只有`struct`

## 结构体的定义

```go
type point struct {i, j int}
```

示例：

```go
package main

import "fmt"

type treeNode struct {
	value       int
	left, right *treeNode // 指针
}

func main() {
	// 建立了一个根节点
	var root treeNode

	root = treeNode{value: 3}
	root.left = &treeNode{}
	root.right = &treeNode{5, nil, nil}
	root.right.left = new(treeNode) // new 返回的是一个地址

	nodes := []treeNode{
		{value: 3},
		{},
		{6, nil, &root},
	}

	fmt.Println(nodes)
}

```

`Go`语言使用`.`的方式进行调用变量或者调用函数或者调用指针。

如果想要使用类似类中的构造函数，我们需要自己定义工厂函数

```go
func createNode(value int) *treeNode {
	return &treeNode{value: value}
}
```

```go
root.left.right = createNode(2)
```

**注意：这里是返回的是函数体内部的局部变量的地址！**

**那么这个局部变量是分配在栈上还是在堆上呢？**

> -   不需要知道
> -   根据编译器和运行环境来决定的

> 如果这里的返回值没有取地址且返回出去，编译器很可能认为这个变量不需要外面去访问，就在栈上分配；
>
> 当编译器看到你这个加了取地址返回给别人使用时，它就会去堆上去分配，然后`treeNode`会参与垃圾回收机制，外面拿着指针的人去做事，等到做完了，扔掉不用了，就会被回收掉。

> 在`Go`语言中可以这样使用，但是在`C++`里就会发生错误！

---

通过上述的代码，我们构造了一个如下图的树结构：

![树结构](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220320153739.png)

我们对其进行遍历操作：

我们首先要为这个结构体定义方法，这个方法不是写在结构体里的，而是要写在结构体外部的。

```go
func (node treeNode) print()  {
	fmt.Print(node.value)
}
```

**它的`func`有一个特点，有一个`接收者`**，表示这个`print`方法是给这个`node`来进行使用的。

```go
root.print()
```

当我们调用了`root.print()`就是代表`root`是`print`函数的接收者，这里为什么会放在前面呢，但其实放在函数括号内也可以，无非是调用的方式变了：

```go
func print(node treeNode)  {
	fmt.Print(node.value)
}
```

调用方式就变为：

```go
print(root)
```

其实和上面的没啥两样。

**这两种方式都相当于参数传递，但是这两个是引用传参呢还是值传递呢？**

> `Go`当然是值传递了

```go
func (node treeNode) setValue(value int) {
	node.value = value
}
```

然后我们来修改某一个节点的值

```go
func main() {
	// 建立了一个根节点
	var root treeNode

	root = treeNode{value: 3}
	root.left = &treeNode{}
	root.right = &treeNode{5, nil, nil}
	root.right.left = new(treeNode)
	root.left.right = createNode(2)

    // 这里设置vlaue = 4
	root.right.left.setValue(4)
    // 打印其实，它没有变成4，还是0，所以Go是值传递
	root.right.left.print()
	fmt.Println()
}

```

我们如何更改为可以修改它的值呢？

```go
func (node *treeNode) setValue(value int) {
	node.value = value
}
```

我们只要将参数传递变为指针类型。我们调用的时候，语法上会有一些人性化的事情，如果接收者变成了指针接收者，它实际调用的会把`root.right.left`的地址传给它，再说了，这个`root.right.left`其实也是指针类型；当我们调用`root.print()`的时候，其实也会解析出当前的地址，来获取到对应的`value`，拷贝一份值给它，进行打印。

我们再次进行调用上述代码，最终值变成了`4`

> -   只有使用指针才可以改变结构内容
> -   `nil`指针也可以调用方法！

使用`nil`调用方法

```go
func (node *treeNode) setValue(value int) {
	if node == nil {
		fmt.Println("setting a value to nil node. Ignored.")
		return
	}
	node.value = value
}
```

### 中序遍历

```go
func (node *treeNode) traverse() {
	if node == nil {
		return
	}
	// 中序遍历 左中右
	node.left.traverse()
	node.print()
	node.right.traverse()
}
```

```bash
0 2 3 4 5
```

结合上述的图来看，因为 4 是后面设置的值，所以此时的图应该是 5 左下角的应该是 4.

### 值接收者和指针接收者

-   要改变内容必须使用指针接收者
-   结构过大也考虑使用指针接收者
-   一致性：如有指针接收者，最好都是指针接收者（**建议**）
-   **值接收者**是`Go`语言特有的
-   值/指针接收者均可接收值/指针
