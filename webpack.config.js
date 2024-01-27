const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: 'babel-loader',
        },
        {
            test: /\.(png|jpe?g|gif)$/i,
            use: [
            {
                loader: 'file-loader',
            },
            ],
        },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'),
    },
    hot: true,
  },
};