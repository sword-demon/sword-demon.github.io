---
title: ios开发者的flutter学习
date: 2023-06-15 21:36:10
category: Flutter
tag:
    - flutter
    - ios
---

# ios 开发者的 flutter 快速上手指南

## IOS 主要的概念和 Flutter 的对应关系

| 主要概念 | IOS 中                  | Flutter 中的对应            |
| -------- | ----------------------- | --------------------------- |
| 页面     | ViewController          | Widget                      |
| 视图     | UIView                  | Widget                      |
| 页面跳转 | UINavigationController  | Navigator                   |
| 网络库   | Alamofire、AFNetworking | http                        |
| 数据存储 | NSUserDefaults、FMDB    | shared_preferences、sqflite |

## 相关布局的对应关系

| 主要概念 | IOS 中                        | Flutter 中的对应 |
| -------- | ----------------------------- | ---------------- |
| 布局文件 | Storyboard、xib               | Widget           |
| 滚动视图 | ScrollView                    | ListView         |
| 列表     | UITableView、UICollectionView | ListView         |
| 文本框   | TextView                      | Text             |
| 输入框   | TextView                      | TextField        |

## 网络操作

使用 HTTP 库

**第一步：添加依赖**

在`pubspec.yaml`中引入`http`插件

在项目根目录下执行

```yml
➜  started_flutter flutter pub add htt
Because started_flutter depends on htt any which doesn't exist (could not find
package htt at https://pub.dev), version solving failed.
➜  started_flutter
➜  started_flutter flutter pub add http
Resolving dependencies...
collection 1.17.1 (1.17.2 available)
+ http 1.0.0
+ http_parser 4.0.2
lints 2.1.0 (2.1.1 available)
matcher 0.12.15 (0.12.16 available)
material_color_utilities 0.2.0 (0.5.0 available)
source_span 1.9.1 (1.10.0 available)
test_api 0.5.1 (0.6.0 available)
+ typed_data 1.3.2
Changed 3 dependencies!
```

或者直接在依赖文件中添加

```yml
dependencies:
    http: <latest_version>
```

需要自己修改版本。

**第二步：导入 http**

在`dart`文件中导入

```dart
import 'package:http/http.dart' as http;
```

### 使用 http 库做 get 请求

```dart
///发送Get请求
  _doGet() async {
    var uri = Uri.parse('https://api.devio.org/uapi/test/test?requestPrams=ChatGPT');
    var response = await http.get(uri);
    //http请求成功
    if (response.statusCode == 200) {
      setState(() {
        resultShow = response.body;
      });
    } else {
      setState(() {
        resultShow = "请求失败：code: ${response.statusCode}，body:${response.body}";
      });
    }
  }
```

`http.get()`返回一个包含`http.Response`的`Future`：

-   [Future](https://api.flutter.dev/flutter/dart-async/Future-class.html)：是与异步操作一起工作的核心 Dart 类，它用于表示未来某个时间可能会出现的可用值或错误；
-   `http.Response`：类包含一个成功的 HTTP 请求接收到的数据；
-   `response.statusCode`：通过 statusCode 可以获取 http 请求状态码，200 代表请求成功；
-   `response.body`：通过 body 获取返回的数据；

### 使用 http 做 post 请求

使用 post 传递的数据常用的内容类型主要有两种：

-   `x-www-form-urlencoded`
-   `application/json`

### 发送`x-www-form-urlencoded`（后面简称 form 类型）类型的数据：

form 类型是 post 请求中较为常见的一种内容类型，也是 http 库默认的内容类型。

注意：body 必须为`Map<String, String>`类型。

> 代码示例：

```dart
  _doPost() async {
    var uri = Uri.parse('https://api.devio.org/uapi/test/test');
    var params = {"requestPrams": "doPost：ChatGPT"};//数据格式必须为Map<String, String>
    var response = await http.post(uri, body: params); //默认为x-www-form-urlencoded 格式，所以可以不用设置content-type
    //http请求成功
    if (response.statusCode == 200) {
      setState(() {
        resultShow = response.body;
      });
    } else {
      setState(() {
        resultShow = "请求失败：code: ${response.statusCode}，body:${response.body}";
      });
    }
  }
```

`http.post()`返回一个包含`http.Response`的`Future`：

-   [Future](https://docs.flutter.io/flutter/dart-async/Future-class.html)：是与异步操作一起工作的核心 Dart 类。它用于表示未来某个时间可能会出现的可用值或错误；
-   `http.Response`：类包含一个成功的 HTTP 请求接收到的数据；

### 发送`application/json`（后面简称 json 类型）类型的数据

要发送 json 类型的数据，主要有以下步骤：

1.  将数据转换为 json String，可以利用 jsonEncode()来转；
2.  将 json 数据赋值给 body 参数；
3.  在 header 中设置`content-type`为`application/json`；

```dart
 ///发送Json类型的Post请求
  _doPostJson() async {
    var uri = Uri.parse('https://api.devio.org/uapi/test/testJson');
    var params = {"requestPrams": "doPost：ChatGPT"};
    var response = await http.post(uri, body: jsonEncode(params), //将数据转成json string
        headers: {
          //设置content-type为application/json
          "content-type": "application/json"
        });
    //http请求成功
    if (response.statusCode == 200) {
      setState(() {
        resultShow = response.body;
      });
    } else {
      setState(() {
        resultShow = "请求失败：code: ${response.statusCode}，body:${response.body}";
      });
    }
  }
```

### 如何将请求结果展示在界面上

```dart
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class HttpICan extends StatefulWidget {
  const HttpICan({Key? key}) : super(key: key);

  @override
  State<HttpICan> createState() => _HttpICanState();
}

class _HttpICanState extends State<HttpICan> {
  var resultShow = '';
  var resultShow2 = '';

  get _goGetBtn =>
      ElevatedButton(onPressed: _doGet, child: const Text('发送Get请求'));

  get _doPostBtn =>
      ElevatedButton(onPressed: _doPost, child: const Text('发送Post请求'));

  get _doPostJsonBtn => ElevatedButton(
      onPressed: _doPostJson, child: const Text('发送Json格式的Post请求'));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('带你玩转Flutter http网络操作'),
      ),
      body: Column(
        children: [
          _goGetBtn,
          _doPostBtn,
          _doPostJsonBtn,
          Text('返回的结果：$resultShow'),
          Text('解析数据msg：$resultShow2')
        ],
      ),
    );
  }

  ///发送Get请求
  void _doGet() async {
    var uri =
        Uri.parse('https://api.devio.org/uapi/test/test?requestPrams=ChatGPT');
    var response = await http.get(uri);
    //http请求成功
    if (response.statusCode == 200) {
      setState(() {
        resultShow = response.body;
      });
    } else {
      setState(() {
        resultShow = '请求失败：code:${response.statusCode}, body:${response.body}';
      });
    }
  }

  ///发送Post请求
  void _doPost() async {
    var uri = Uri.parse('https://api.devio.org/uapi/test/test');
    var params = {'requestPrams': 'doPost:ChatGPT'};
    var response = await http.post(uri, body: params);
    //http请求成功
    if (response.statusCode == 200) {
      setState(() {
        resultShow = response.body;
      });
    } else {
      setState(() {
        resultShow = '请求失败：code:${response.statusCode}, body:${response.body}';
      });
    }
  }

  void _doPostJson() async {
    var uri = Uri.parse('https://api.devio.org/uapi/test/testJson');
    var params = {'requestPrams': 'doPost:ChatGPT'};
    var response = await http.post(uri,
        body: jsonEncode(params), //将数据转成json string
        headers: {
          //设置content-type为application/json
          "content-type": "application/json"
        });
    //http请求成功
    if (response.statusCode == 200) {
      setState(() {
        resultShow = response.body;
      });
      var map = jsonDecode(response.body);
      setState(() {
        resultShow2 = map['msg'];
      });
    } else {
      setState(() {
        resultShow = '请求失败：code:${response.statusCode}, body:${response.body}';
      });
    }
  }
}
```

### 如何将 Response 转换成 Dart object

使用`dart:convert` 中的`jsonDecode`将 json string 转成 Map

```dart
var map = jsonDecode(response.body);
      setState(() {
        resultShow2 = map['msg'];
      });
```

![image-20230612213850411](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230612213850411.png)
