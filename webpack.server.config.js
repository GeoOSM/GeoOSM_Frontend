// webpack.server.config.js
var nodeExternals = require('webpack-node-externals');
var path = require('path');
var webpack = require('webpack');


module.exports = {
    entry: {
        server: "./src/server.ts"
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    target: "node",
    // this makes sure we include node_modules and other 3rd party libraries
    externals: [nodeExternals({
        whitelist: [
            /^ngx-bootstrap/,
            /^angulartics2/,
            /^mydaterangepicker/
        ]
    }),
        /(main\..*\.js)/],
    node: {
        __dirname: false,
        __filename: false
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            }
        ]
    }
};