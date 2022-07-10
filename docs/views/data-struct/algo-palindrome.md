---
title: Go实现回文检测
date: 2022-7-10 17:21:10
category: DataStruct
tag:
 - palindrome
---
## Go语言实现回文检测

```go
package main

import (
	"strings"
)

/**
回文检测，正序和逆序读是一样的
*/

func Prime(s string) bool {
	var temp = strings.Split(s, "")
	for i, j := 0, len(temp) - 1; i < j; {
		if temp[i] != temp[j] {
			return false
		}
		i++
		j--
	}
	return true
}

func main() {
	print(Prime("上海自来水来自海上"))
}

```
