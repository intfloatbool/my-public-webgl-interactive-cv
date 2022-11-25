const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            }
        ],
    },

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "./dist/")
    },

    devServer: {
        static: {
            directory: path.join(__dirname, "./dist/")
        },
        compress: true,
        port: 9000
    },

    plugins: [
        new CopyPlugin({
          patterns: [
            { from: "src/assets", to: "assets" },
            { from: "src/index.html", to: "index.html" },
          ],
        }),
      ],
};