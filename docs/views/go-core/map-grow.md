---
title: map的扩容
date: 2022-07-17 14:44:10
category: GoCore
tag:
    - grown
    - bucket
---

## map 为什么要扩容

源码位置：`runtime`包下的`map.go`里的`mapassign`方法

-   `map`溢出桶太多时会导致严重的性能下降

-   `runtime.mapassign()`可能会触发扩容

    ```go
    // If we hit the max load factor or we have too many overflow buckets,
    // and we're not already in the middle of growing, start growing.
    if !h.growing() && (overLoadFactor(h.count+1, h.B) || tooManyOverflowBuckets(h.noverflow, h.B)) {
        hashGrow(t, h)
        goto again // Growing the table invalidates everything, so try again
    }
    ```

    -   装载因子超过 6.5(平均每个槽 6.5 个`key`)
    -   使用了太多溢出桶(溢出桶超过了普通桶的数量就要开始考虑扩容)

## map 扩容的类型

-   等量扩容：数据不多但是溢出桶太多了
-   翻倍扩容：数据太多了

## map 扩容步骤

### 步骤一

1.  创建一组新桶
2.  `oldbuckets`指向原有的桶数组
3.  `buckets`指向新的桶数组
4.  `map`标记为扩容状态

源码：

```go
func hashGrow(t *maptype, h *hmap) {
	// If we've hit the load factor, get bigger.
	// Otherwise, there are too many overflow buckets,
	// so keep the same number of buckets and "grow" laterally.
	bigger := uint8(1)
	if !overLoadFactor(h.count+1, h.B) {
		bigger = 0
		h.flags |= sameSizeGrow
	}
	oldbuckets := h.buckets
	newbuckets, nextOverflow := makeBucketArray(t, h.B+bigger, nil)

	flags := h.flags &^ (iterator | oldIterator)
	if h.flags&iterator != 0 {
		flags |= oldIterator
	}
	// commit the grow (atomic wrt gc)
	h.B += bigger
	h.flags = flags
	h.oldbuckets = oldbuckets
	h.buckets = newbuckets
	h.nevacuate = 0
	h.noverflow = 0

	if h.extra != nil && h.extra.overflow != nil {
		// Promote current overflow buckets to the old generation.
		if h.extra.oldoverflow != nil {
			throw("oldoverflow is not nil")
		}
		h.extra.oldoverflow = h.extra.overflow
		h.extra.overflow = nil
	}
	if nextOverflow != nil {
		if h.extra == nil {
			h.extra = new(mapextra)
		}
		h.extra.nextOverflow = nextOverflow
	}

	// the actual copying of the hash table data is done incrementally
	// by growWork() and evacuate().
}
```

![grow](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220717142728.png)

### 步骤二

-   将所有的数据从旧桶驱逐到新桶
-   采用渐进式驱逐
-   每次操作一个旧桶时，将旧桶数据驱逐到新桶
-   读取时不进行驱逐，只判断读取新桶还是旧桶

```go
// 驱逐方法
func growWork(t *maptype, h *hmap, bucket uintptr) {
	// make sure we evacuate the oldbucket corresponding
	// to the bucket we're about to use
	evacuate(t, h, bucket&h.oldbucketmask())

	// evacuate one more oldbucket to make progress on growing
	if h.growing() {
		evacuate(t, h, h.nevacuate)
	}
}
```

### 步骤三

-   所有旧桶驱逐完成后
-   `oldbuckets`回收

![回收](https://xingqiu-tuchuang-1256524210.cos.ap-shanghai.myqcloud.com/4021/20220717144128.png)

## 总结

-   装载系数或者溢出桶的增加，会触发`map`扩容
-   扩容可能并不是增加桶数、而是整理
-   `map`的扩容采用渐进式，而不是一次性完成；桶被操作时才会重新分配
