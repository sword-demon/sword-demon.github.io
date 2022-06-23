---
title: Map的底层
date: 2022-06-24 00:43:10
category: GoCore
tag:
    - theory
    - map
---

## 定义

存储一个 KV 模式的数据类型

```go
map[K]V
map[K1]map[K2]V
```

案例：

```go
m := map[string]string {
    "name": "wujie",
    "course": "golang",
    "site": "wjstar",
    "quality": "notbad",
  }

m2 := make(map[string]int) // empty map

var m3 map[string]int // nil

fmt.Println(m, m2, m3)
```

```bash
map[course:golang name:wujie quality:notbad site:wjstar] map[] map[]
```

## 遍历操作

```go
func map1() {
  m := map[string]string {
    "name": "wujie",
    "course": "golang",
    "site": "wjstar",
    "quality": "notbad",
  }

  fmt.Println("Traversing map")

  for k, v := range m {
    fmt.Println(k, v)
  }
}
```

```bash
Traversing map
name wujie
course golang
site wjstar
quality notbad

```

这里的`k`也可以使用`_`进行省略

```go
for _, v := range m {
    fmt.Println(v)
}
```

几次运行下来，可以发现一个问题：

> 有时候键”name“是在前面的，有时候键”quality“是在前面的。

这说明了一个这个`k` 在`map`里是无序的，而且底层是`HashMap`

## 获取 map 的值

```go
func map1() {
  m := map[string]string {
    "name": "wujie",
    "course": "golang",
    "site": "wjstar",
    "quality": "notbad",
  }

  fmt.Println("Getting value")
    // 存在的key
  courseName := m["course"]
  fmt.Println(courseName)
    // 不存在的key
  causeName := m["cause"]
  fmt.Println(causeName)
}
```

这里我们测试了一个不存在的`k`去获取值，此时会得到一个空的字符串，虽然在控制台打印看不出啥，但是正符合了`go`语言定义的一个总归会有一个`Zero value`提供使用。

但是我们如何进行判断这个`k`是否存在呢？

```go
fmt.Println("Getting value")
courseName, ok := m["course"]
fmt.Println(courseName, ok)
if causeName, ok := m["cause"]; ok {
    fmt.Println(causeName)
} else {
    fmt.Println("key does not exist")
}
```

```bash
golang true
key does not exist

```

## 删除元素

```go
fmt.Println("deleting values")
name, ok := m["name"]
fmt.Println(name, ok)

delete(m, "name")

name, ok = m["name"]
fmt.Println(name, ok)
```

```bash
wujie true
 false

```

## Map 的 Key

-   `map`使用了哈希表，必须可以比较相等
-   除了`slice,map,function`的内奸类型都可以作为`key`
-   `Struct`类型不包含上述字段，也可以作为`key`，在编译的时候会进行检查

## 实例

> 寻找最长不含有重复字符的子串

从`abcabcbb` -> `abc`

从`bbbbb` -> `b`

从`pwwkew` -> `wke`

思路步骤：

对于每一个字母`x`

-   `lastOccurred[x]`不存在，或者`< start` 则无需操作
-   `lastOccurred[x] >= start`，则更新`start`的位置
-   更新`lastOccurred[x]`，更新`maxLength`

```go
func lengthOfNnRepeatingSubStr(s string) int {
  lastOccurred := make(map[byte]int)
  start := 0
  maxLength := 0
  for i, ch := range []byte(s) {
        // 避免ch为0的情况
    lastI, ok := lastOccurred[ch]
    if ok && lastI >= start {
      // 更新 start
      start = lastI + 1
    }
    if i-start+1 > maxLength {
      maxLength = i - start + 1
    }
    lastOccurred[ch] = i
  }
  return maxLength
}

func map2() {
  fmt.Println(lengthOfNnRepeatingSubStr("abcabcbb")) // 3
  fmt.Println(lengthOfNnRepeatingSubStr("bbbbbbb")) // 1
  fmt.Println(lengthOfNnRepeatingSubStr("pwwkew")) // 3
  fmt.Println(lengthOfNnRepeatingSubStr("")) // 0
  fmt.Println(lengthOfNnRepeatingSubStr("b")) // 1
  fmt.Println(lengthOfNnRepeatingSubStr("abcdef")) // 6
}

func main() {
  map2()
}
```

```go
fmt.Println(lengthOfNnRepeatingSubStr("这里是中文"))
fmt.Println(lengthOfNnRepeatingSubStr("一二三二一"))
```

假如这里使用了中文，这里就不对了，因为这里是使用的`byte`类型，必须转换为`ascii`。

## 操作总结

-   创建：`make(map[string]int)`
-   获取元素：`m[k]`
-   `key`不存在时，获得`value`类型的初始值
-   用`value, ok := m[key]`来判断是否存在`key`
-   使用`range`遍历`key`或者遍历`key value`对
-   遍历不保证顺序，如果需要顺序，需手动对`key`排序
-   使用`len`获得元素个数

## HashMap 的基本方案

-   开放寻址法
-   拉链法

### 开放寻址法

:::tip 大致过程

1. 首先有一个底层数组已经存了一部分的`KV`值
2. 进来一个新的`a:A`键值
3. 首先经过`Hash`，`hash`的是`k`，哈希成一个数据，然后对数组的长度取模，可以算出这个键要去数组的几号位
4. 假如要去的目标的地址已经有人占用了，就向后去寻找目标的地址，如果向后的也被占了，就继续往后，遇到空闲的，就进行分配

:::

![开放寻址1](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220517215156.png)

![xunzhi](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220517215514.png)

> 读取也是差不多的一个流程，如果哈希再经过取模之后，从 1 号位开始往后找，直到找到为止。

### 拉链法

:::tip 主要流程

1. 同样的也会经过 hash 然后取模，找到位置
2. 但是对于的位置并不直接放数据，每一个位置上都是存的指针，会额外放的一个像链表的东西
3. 产生相同的 hash 的时候，就会在下面继续追加一个键值，这个就解决了`hash`碰撞的位置，纵向的往下拉一个链表

读取：

1. 同样经过 hash 取模之后找到位置
2. 然后找到对应的链表进行遍历即可获取到对应的数据

:::

![拉链法](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220517215746.png)

![charu](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220517220235.png)

### Go 的 map

有一个`map.go`文件里面有一个结构体：`hmap`

```go
// A header for a Go map.
type hmap struct {
  // Note: the format of the hmap is also encoded in cmd/compile/internal/reflectdata/reflect.go.
  // Make sure this stays in sync with the compiler's definition.
  count     int // # live cells == size of map.  Must be first (used by len() builtin)
  flags     uint8
    // 桶数量的2 的对数
  B         uint8  // log_2 of # of buckets (can hold up to loadFactor * 2^B items)
  noverflow uint16 // approximate number of overflow buckets; see incrnoverflow for details
  hash0     uint32 // hash seed 用于计算k的哈希值的

    // 桶 => 拉链法
  buckets    unsafe.Pointer // array of 2^B Buckets. may be nil if count==0.
  oldbuckets unsafe.Pointer // previous bucket array of half the size, non-nil only when growing
  nevacuate  uintptr        // progress counter for evacuation (buckets less than this have been evacuated)

  extra *mapextra // optional fields
}
```

`bmap`代表了`hmap`里面的桶的内容

```go
// A bucket for a Go map.
type bmap struct {
  tophash [bucketCnt]uint8 // key 的哈希值 8个哈希值
}
```

```go
bucketCntBits = 3
bucketCnt     = 1 << bucketCntBits // 8

```

![gomap](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220517221233.png)

### map 的初始化

#### 使用 make 初始化

```go
m := make(map[string]int, 10)
```

这里编译下来它调用了`runtime.makemap_small`方法，如果是`windows`可能是`makemap`方法，我现在是`mac m1`架构的

```go
func makemap_small() *hmap {
  h := new(hmap)
  h.hash0 = fastrand()
  return h
}
```

```go
func makemap(t *maptype, hint int, h *hmap) *hmap {
  mem, overflow := math.MulUintptr(uintptr(hint), t.bucket.size)
  if overflow || mem > maxAlloc {
    hint = 0
  }

  // initialize Hmap
  if h == nil {
    h = new(hmap)
  }
  h.hash0 = fastrand()

  // Find the size parameter B which will hold the requested # of elements.
  // For hint < 0 overLoadFactor returns false since hint < bucketCnt.
  B := uint8(0)
  for overLoadFactor(hint, B) {
    B++
  }
  h.B = B

  // allocate initial hash table
  // if B == 0, the buckets field is allocated lazily later (in mapassign)
  // If hint is large zeroing this memory could take a while.
  if h.B != 0 {
    var nextOverflow *bmap
    h.buckets, nextOverflow = makeBucketArray(t, h.B, nil)
    if nextOverflow != nil {
            // 存储溢出桶
      h.extra = new(mapextra)
            // 下一个可用的溢出桶的位置
      h.extra.nextOverflow = nextOverflow
    }
  }

  return h
}

```

![mapmake初始化](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220518225710.png)

#### 字面量初始化

-   元素少于 25 个时，转化为简单赋值

```go
hash := map[string]int{
    "1": 2,
    "3": 4,
    "5": 6,
}
```

编译的时候直接 给你改成下面的：

```go
hash := make(map[string]int, 3)
hash["1"] = 2
hash["3"] = 4
hash["5"] = 6
```

-   元素多于 25 个时，转换为循环赋值

```go
hash := map[string]int{
    "1": 2,
    "2": 2,
    "3": 4,
    ...
    "26": 26,
}
```

转化

```go
hash := make(map[string]int, 26)
// 存放key的数组
vstatk := []string{"1", "2", "3", ..., "26"}
// 存放value的数组
vstatv := []int{1, 2, 3, ..., 26}
for i := 0; i < len(vstatk); i++ {
    hash[vstatk[i]] = vstatv[i]
}
```

## 总结

-   Go 语言使用了拉链法实现了`hashmap`
-   每一个桶中存储键哈希的前 8 位
-   桶超出 8 个数据，就会存储到溢出桶中

```bash
0x001c 00028 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:6)       PCDATA  $1, ZR
       0x001c 00028 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:6)       CALL    runtime.makemap_small(SB)
       0x0020 00032 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:6)       MOVD    8(RSP), R0
       0x0024 00036 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:7)       STP     (ZR, ZR), ""..autotmp_11-16(SP)
       0x0028 00040 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:7)       MOVD    $type.map[string]int(SB), R1
       0x0030 00048 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:7)       MOVD    R1, ""..autotmp_11-16(SP)
       0x0034 00052 (/Users/wujie/GolangProjects/src/rpc-test/demo/demo4.go:7)       MOVD    R0, ""..autotmp_11-8(SP)

```
