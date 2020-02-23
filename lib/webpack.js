const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');
module.exports = class webpack {
  constructor(options) {
    const { entry, output } = options;
    this.options = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
  }

  run() {
    // 开始分析入口模块的内容
    const info = this.parse(this.entry);
    this.modules.push(info);

    for(let i =0; i<this.modules.length; i++) {
      const item = this.modules[i];
      const { dependencies } = item;
      if (dependencies) {
        Object.keys(dependencies).forEach(key => {
          this.modules.push(this.parse(dependencies[key]));
        })
      }
    }

    // 数据结构转换
    const graph = {};
    this.modules.forEach(({ entryFile, dependencies, code }) => {
      graph[entryFile] = { dependencies, code };
    })

    // 生成代码
    this.generateCode(graph);
  }

  parse(entryFile) {
    const content = fs.readFileSync(entryFile, 'utf-8');

    // 使用parser分析内容，返回AST抽象语法树
    const ast = parser.parse(content, {
      sourceType: 'module'
    });

    // 提取依赖路径信息
    const dependencies = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        // node.source.value 这个路径是相对于入口的相对路径
        const newPath = './' + path.join(path.dirname(entryFile), node.source.value);
        dependencies[node.source.value] = newPath;
      }
    })

    // 代码编译
    const { code } = transformFromAst(ast, null, {
      presets: ['@babel/preset-env']
    });
    
    // 信息汇总，返回
    return {
      entryFile,
      dependencies,
      code,
    }
  }

  generateCode(graph) {
    // 生成bundle.js => dist/main.js
    const filePath = path.join(this.output.path, this.output.filename);
    const bundle = `(function(graph) {
      function require(module) {
        function localRequire(relativePath) {
          return require(graph[module].dependencies[relativePath]);
        }
        var exports = {};
        (function(require, exports, code) {
          eval(code)
        })(localRequire, exports, graph[module].code)
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(graph)})`;

    // 写文件操作
    fs.writeFileSync(filePath, bundle, 'utf-8');
  }
}
