const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
    transpileDependencies: true,
    productionSourceMap: false,
    publicPath: "/ats/",

    configureWebpack: {
        devtool: false,
        name: "ats",
    },

    pages: {
        index: "src/main.js",
    },

    // 拆包优化
    chainWebpack: (config) => {
        config.optimization.splitChunks({
            chunks: "all",
        });
    },

    devServer: {
        proxy: {
            "/": {
                target: "https://uias.localvm.outsrkem.top:30078",
                changeOrigin: true,
                secure: false,
                pathRewrite: {
                    "^/": "/",
                },
            },
        },
        webSocketServer: false,
    },
});
