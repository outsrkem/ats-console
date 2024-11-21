const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: '/ats/',

    pages: {
        index: 'src/main.js',
    },

    configureWebpack: {
        name: 'ats'
    },

    devServer: {
        proxy: {
          '/': {
            target: 'https://127.0.0.1:18185/',
            changeOrigin: true,
            secure: false,
            pathRewrite: {
              '^/': '/'
            }
          }
        },
        webSocketServer: false,
    },

    productionSourceMap: false,
})
