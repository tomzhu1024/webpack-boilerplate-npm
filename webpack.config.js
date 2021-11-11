const path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackBarPlugin = require('webpackbar');
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const env = require('./utils/env');

const isDevelopment = env.NODE_ENV !== 'production';

let config = {
  entry: {
    index: path.resolve(__dirname, 'src/index.tsx'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    library: {
      type: 'umd',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.tsx?$/i,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: { lessOptions: { javascriptEnabled: true } },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]_[hash:6].[ext]',
              esModule: false,
              limit: 0,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
};

if (isDevelopment) {
  config = merge(config, {
    mode: 'development',
    stats: false,
    watch: true,
    devtool: 'inline-cheap-module-source-map',
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
    ],
  });
} else {
  config = merge(config, {
    mode: 'production',
    stats: true,
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/i,
          enforce: 'pre',
          exclude: /node_modules/,
          use: [
            {
              loader: 'webpack-strip-block',
              options: {
                start: 'debug:start',
                end: 'debug:end',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new WebpackBarPlugin(),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
    },
    performance: {
      maxEntrypointSize: 4096000,
      maxAssetSize: 1024000,
    },
  });
}

module.exports = config;
