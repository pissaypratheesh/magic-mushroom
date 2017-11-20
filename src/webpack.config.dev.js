
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
//var Visualizer = require('webpack-visualizer-plugin');
import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import WebpackMd5Hash from 'webpack-md5-hash';
var CompressionPlugin = require('compression-webpack-plugin');


//import WebpackCleanupPlugin from 'webpack-cleanup-plugin';

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('development'),
  __DEV__: false
};
// alias: {
//   'react': 'react-lite',
//   'react-dom': 'react-lite'
// }

export default {
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
  },
  devtool: 'eval-source-map', // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps and https://webpack.github.io/docs/configuration.html#devtool
  entry: [
    'babel-polyfill',
    './src/webpack-public-path',
    'react-hot-loader/patch',
    'webpack-hot-middleware/client?reload=true',
    path.resolve(__dirname, 'index.js'), // Defining path seems necessary for this to work consistently on Windows machines.
    path.resolve(__dirname, 'sw.js')
  ],
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
  target: 'web', // necessary per https://webpack.github.io/docs/testing.html#compile-and-test
  output: {
    path:__dirname, // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: 'bundle2.js'
  },

  devServer: {
    hot: true,
    inline: false,
    contentBase: __dirname,
    port: 3000,
    host: "0.0.0.0",
    publicPath: "/",
    historyApiFallback: true,
    disableHostCheck: true
  },

  plugins: [
    new WebpackMd5Hash(),

    // Tells React to build in prod mode. https://facebook.github.io/react/downloads.html
    new webpack.DefinePlugin(GLOBALS),

    new webpack.NamedModulesPlugin(),


    // Generate an external css file with a hash in the filename
    new ExtractTextPlugin('[name].[contenthash].css'),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // Minify JS
    new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new LodashModuleReplacementPlugin({
      'collections': true,
      'paths': true
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nb/)
    // new BundleAnalyzerPlugin(),
    //new WebpackCleanupPlugin(),
  ],
  module: {
    rules: [
      {test: /\.js$/, include: __dirname,loader: "babel-loader",
        query: {
          presets: [
            ["es2015", { modules: false }],
            "stage-1",
            "react"
          ],
          plugins: [
            "transform-async-to-generator",
            "transform-decorators-legacy"
          ]
        }
      },
      {test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader']},
      {test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader'},
      {test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
      {test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
      {test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader?name=[name].[ext]'},
      {test: /\.ico$/, loader: 'file-loader?name=[name].[ext]'},
      {test: /(\.css|\.scss|\.sass)$/, loaders: ['style-loader', 'css-loader?sourceMap']}
    ]
  }
};
