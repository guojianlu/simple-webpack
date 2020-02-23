# 这是一个简易版的webpack

```
$ git clone
$ node bundle.js  // 进行打包
```

## 创建一个webpack
- 接收一份配置(webpack.config.js)
- 分析出入口模块位置
  + 读取⼊口模块的内容，分析内容
  + 哪些是依赖
  + 哪些是源码
    - es6, jsx 处理 需要编译 -> 浏览器器能够执⾏
  + 分析其他模块
- 拿到对象数据结构
  + 模块路径
  + 处理好的内容
- 创建bundle.js
  + 启动器器函数，来补充代码⾥里里有可能出现的module exports require，让浏览器器能够顺利利的执⾏