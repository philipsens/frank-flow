const path = require('path');
const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  watch: true,
  optimization: {
    splitChunks: {
        cacheGroups: {
            monacoCommon: {
                test: /[\\/]node_modules[\\/]monaco\-editor/,
                name: 'monaco-editor-common',
                chunks: 'async'
            }
        }
    }
  },
  entry: [
    './app/Controller/MainController.js',
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../main/resources/frontend'),
    // publicPath: '/dist/'
  },
  module: {
    rules: [
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        use: ['file-loader']
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // instead of style-loader
          'css-loader',
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MonacoWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'index.html', to: path.resolve(__dirname, '../main/resources/frontend') },
        { from: 'media', to: path.resolve(__dirname, '../main/resources/frontend/media') },
        { from: 'jquery.contextMenu.min.css', to: path.resolve(__dirname, '../main/resources/frontend') },
        { from: 'app/pipeWithActivity.json', to: path.resolve(__dirname, '../main/resources/frontend') },
      ],
    }),
  ],
  devtool: "inline-source-map",
  target: "web",
};
