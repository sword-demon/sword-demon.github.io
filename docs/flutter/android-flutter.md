---
title: android开发者的flutter学习
date: 2023-06-15 21:36:10
category: Flutter
tag:
    - flutter
    - android
---

# android 开发者的 flutter 快速上手指南

## 通过按钮和变量来变更内容

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '快速上手 Flutter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter快速上手'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  // 变量来实现页面内容切换
  bool _toggle = true;

  get _dyWidget => _toggle ? const Text('Widget1') : Text('widget2');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
          child: _dyWidget),
      floatingActionButton: FloatingActionButton(
        onPressed: _updateWidget,
        tooltip: 'Update',
        child: const Icon(Icons.add),
      ),
    );
  }

  void _updateWidget() {
    setState(() {
      _toggle = !_toggle;
    });
  }
}

```

![image-20230606224929507](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230606224929507.png)

## 创建自定义的控件(widget)

在`vscode`或者`android studio`中输入`stl`关键字就会给你自动生成一个快捷模板

```dart
// 创建自定义 widget
class TipsWidget extends StatelessWidget {
  const TipsWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Text('this is a tips');
  }
}
```

然后就可以在上面主控件里进行加载即可

## 添加一个动态列表

```dart
class _MyHomePageState extends State<MyHomePage> {
  String tips = "";
  bool _toggle = true;

  get _dyWidget => _toggle ? const Text('Widget1') : Text('widget2');
  get _listView => ListView(
        children: [
          Text('快速上手1 flutter1'),
          Text('快速上手1 flutter2'),
          Text(
            '快速上手1',
            style: TextStyle(fontSize: 260),
          ),
        ],
      );
};
```

## 手势事件

### 监听`widget`的手势方法

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '快速上手 Flutter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Flutter快速上手'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _count = 0;

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
      appBar: AppBar(
        // TRY THIS: Try changing the color here to a specific color (to
        // Colors.amber, perhaps?) and trigger a hot reload to see the AppBar
        // change color while the other colors stay the same.
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        // Here we take the value from the MyHomePage object that was created by
        // the App.build method, and use it to set our appbar title.
        title: Text(widget.title),
      ),
      body: Center(
          // Center is a layout widget. It takes a single child and positions it
          // in the middle of the parent.
          child: ElevatedButton(
        child: Text('press me one more $_count'),
        onPressed: () {
          setState(() {
            _count++;
          });
        },
      )),
      floatingActionButton: FloatingActionButton(
        onPressed: _updateWidget,
        tooltip: 'Update',
        child: const Icon(Icons.add),
      ), // This trailing comma makes auto-formatting nicer for build methods.
    );
  }
}
```

![image-20230606230201422](https://virusoss.oss-cn-shanghai.aliyuncs.com/images/image-20230606230201422.png)

### GestureDetector 的使用

```dart
body: Center(
  // Center is a layout widget. It takes a single child and positions it
  // in the middle of the parent.
  child: GestureDetector(
child: Text('press me one more $_count'),
onTap: () {
  setState(() {
    _count++;
  });
},
)),
```

点击事件，点击`GestureDetector`查看源码还有很多的事件。
