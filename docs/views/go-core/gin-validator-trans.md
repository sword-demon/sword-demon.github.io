---
title: gin 自定义验证器和翻译响应内容
date: 2023-02-06 22:09:15
category: GoCore
---

# gin 自定义验证器和翻译响应内容

## validator 翻译文档地址

[https://github.com/go-playground/validator/blob/master/\_examples/translations/main.go](https://github.com/go-playground/validator/blob/master/_examples/translations/main.go)

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/locales/zh"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	"github.com/go-playground/validator/v10/translations/en"
	zh2 "github.com/go-playground/validator/v10/translations/zh"
	"net/http"
	"reflect"
	"strings"
)

type LoginReq struct {
	User     string `form:"user" json:"user" xml:"user" binding:"required,min=3,max=10"`
	Password string `form:"password" json:"password" xml:"password" binding:"required"`
}

type SignupReq struct {
	Age        uint8  `json:"age" binding:"gte=1,lte=130"`
	Name       string `json:"name" binding:"required,min=3"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	RePassword string `json:"re_password" binding:"required,eqfield=Password"` // 跨字段验证
}

var trans ut.Translator

func removeTopStruct(fields map[string]string) map[string]string {
	rsp := map[string]string{}
	for field, err := range fields {
		rsp[field[strings.Index(field, ".")+1:]] = err
	}
	return rsp
}

func InitTrans(locale string) (err error) {
	// 修改 gin 的 validator 引擎属性，实现定制
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		// 注册一个获取 json 的 tag 的自定义方法
		v.RegisterTagNameFunc(func(field reflect.StructField) string {
			name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]
			if name == "-" {
				return ""
			} else {
				return name
			}
		})
		zhCn := zh.New() // 中文翻译器
		uni := ut.New(zhCn, zhCn)
		trans, ok = uni.GetTranslator(locale)
		if !ok {
			return fmt.Errorf("uni.GetTranslator(%s)", locale)
		}
		switch locale {
		case "zh":
			err := zh2.RegisterDefaultTranslations(v, trans)
			if err != nil {
				return err
			}
		case "en":
			err := en.RegisterDefaultTranslations(v, trans)
			if err != nil {
				return err
			}
		default:
			err := zh2.RegisterDefaultTranslations(v, trans)
			if err != nil {
				return err
			}
		}
		return
	}
	return
}

func main() {
	if err := InitTrans("zh"); err != nil {
		fmt.Println(err.Error())
		fmt.Println("初始化翻译器错误")
		return
	}
	r := gin.Default()

	r.POST("/login", func(c *gin.Context) {
		var loginReq LoginReq
		err := c.ShouldBind(&loginReq)
		if err != nil {
			errs, ok := err.(validator.ValidationErrors)
			if !ok {
				c.JSON(http.StatusOK, gin.H{
					// 返回原错误
					"msg": err.Error(),
				})
			}
			c.JSON(http.StatusBadRequest, gin.H{
				"error": removeTopStruct(errs.Translate(trans)), // 处理错误提示前面的结构体名称
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"msg": "登录成功",
		})
	})

	r.POST("/register", func(c *gin.Context) {
		var signupReq SignupReq
		err := c.ShouldBind(&signupReq)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"msg": "注册成功",
		})
	})

	err := r.Run()
	if err != nil {
		fmt.Println(err.Error())
		return
	}
}

```
