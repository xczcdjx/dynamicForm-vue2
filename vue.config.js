const { defineConfig } = require('@vue/cli-service')
let externals={}
if (process.env.NODE_ENV === 'production') {
  externals={
    vue: {
      root: 'Vue',        // UMD 挂到全局的名字
          commonjs: 'vue',
          commonjs2: 'vue',
          amd: 'vue',
    },
  }
}
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    extract: true, // 确保打成独立 css 文件
  },
  configureWebpack: {
    externals,
    optimization: {
      minimize: true, // 👈 关键：库模式下强制压缩
    },
  },
})
