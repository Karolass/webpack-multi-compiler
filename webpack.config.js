const path = require('path')
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// init
try {
  fs.unlinkSync('./dist/index.html')
} catch (e) {}

const NewPlugin = function () {}
NewPlugin.prototype.apply = function (compiler) {
  if (compiler.hooks) {
    // webpack 4
    compiler.hooks.compilation.tap('beforeHtml', (compilation) => {
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('beforeHtml', (data, callback) => {
        test(compilation, data, callback)
      })
    })

    if (process.env.NODE_ENV !== 'production') {
      compiler.hooks.compilation.tap('AfterEmit', function (compilation) {
        compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync('AfterEmit', function (data, callback) {
          write(compilation, data, callback)
        })
      })
    }
  } else {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('html-webpack-plugin-before-html-processing', (data, callback) => {
        test(compilation, data, callback)
      })
    })
  }

  function test(compilation, data, callback) {
    // 目前沒啥code 防止跑下一個太快
    setTimeout(() => {
      try {
        const fullPath = path.resolve(compilation.compiler.outputPath, data.outputName)
        const fileString = fs.readFileSync(fullPath, 'utf8')
        data.html = fileString
      } catch (e) {}
      callback(null, data)
    }, 3000)
  }

  function write(compilation, data, callback) {
    try {
      const fullPath = path.resolve(compilation.compiler.outputPath, data.outputName)
      fs.writeFileSync(fullPath, data.html.source())
    } catch (e) {}
    callback()
  }
}

module.exports = [
  {
    entry: {
      a: './src/js/a'
    },
    output: {
      filename: '[name].[hash:8].js',
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/template/index.html',
        chunks: ['a']
      }),
      new NewPlugin()
    ],
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9000
    },
    devtool: '#eval-source-map'
  },
  {
    entry: {
      b: './src/js/b'
    },
    output: {
      filename: '[name].[hash:8].js',
      path: path.resolve(__dirname, 'dist')
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/template/index.html',
        chunks: ['b']
      }),
      new NewPlugin()
    ],
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9000
    },
    devtool: '#eval-source-map'
  },
]