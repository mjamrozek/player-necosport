const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const SRC_PATH = path.resolve(__dirname, 'src');
const DEST_PATH = path.resolve(__dirname, 'dist');
const DEV = process.env.NODE_ENV === 'development';
const MINIFY = process.env.MINIFY === 'true';

const PUBLIC_PATH = DEV ? '/' : '/player-necosport/';

var config = {
  entry: {
    app: ['babel-polyfill', path.resolve(SRC_PATH, 'main.jsx')]
  },
  output: {
    path: DEST_PATH,
    publicPath: PUBLIC_PATH,
    filename: DEV ? '[name].js' : '[name]-[hash:10].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: !MINIFY
        }
      },
      {
        test: /\.(sass|scss)$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: MINIFY,
                importLoaders: 1
              }
            },
            'postcss-loader',
            'sass-loader'
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /.(jpg|jpeg|png|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          publicPath: PUBLIC_PATH,
          outputPath: 'assets/images/',
          name: DEV ? '[name].[ext]' : '[name]-[sha256:hash:10].[ext]'
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          publicPath: PUBLIC_PATH,
          outputPath: 'assets/fonts/',
          name: DEV ? '[name].[ext]' : '[name]-[sha256:hash:10].[ext]'
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin([DEST_PATH]),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      },
      'DEV': JSON.stringify(DEV)
    }),
    new ExtractTextPlugin({
      filename: DEV ? '[name].css' : '[name]-[hash:10].css'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(SRC_PATH, 'tpl', 'index.pug'),
      publicPath: PUBLIC_PATH,
      chunksSortMode: 'dependency',
      title: 'NECOsport video player'
    })
  ],
  resolve: {
    alias: {
      '@': SRC_PATH
    },
    extensions: ['.js', '.jsx', '.json']
  }
};

switch (process.env.NODE_ENV) {
  case 'development':
  default:
    config = merge(config, {
      devServer: {
        contentBase: DEST_PATH,
        port: 8080,
        open: true,
        overlay: true,
      },
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      devtool: 'source-map'
    });
    break;

  case 'production':
    config = merge(config, {
      plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new LodashModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          minChunks: module => module.context && module.context.includes('node_modules')
        }),
        new webpack.HashedModuleIdsPlugin({
          hashFunction: 'sha256',
          hashDigest: 'hex',
          hashDigestLength: 5
        }),
        new OptimizeCssAssetsPlugin({
          cssProcessor: require('cssnano'),
          cssProcessorOptions: {
            discardComments: {
              removeAll: MINIFY
            }
          }
        }),
        new UglifyJSPlugin({
          uglifyOptions: {
            compress: MINIFY && {
              drop_console: true
            },
            mangle: MINIFY,
            comments: !MINIFY,
          },
          extractComments: /(?:^!|@(?:license|preserve))/i
        }),
      ]
    });
    break;
}

module.exports = config;