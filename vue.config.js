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
            target: 'https://uias-devops.outsrkem.top:30078/',
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
