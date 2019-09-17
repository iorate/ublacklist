const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const LicenseCheckerWebpackPlugin = require('license-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const browser = process.env.BROWSER || 'chrome';
const env = process.env.NODE_ENV || 'development';

const ifdefLoader = {
  loader: 'ifdef-loader',
  options: {
    BROWSER: browser,
    ENV: env,
    'ifdef-triple-slash': false,
  },
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
    'css/content': './scss/content.scss',
    'css/options': './scss/options.scss',
    'js/background': './ts/background.ts',
    'js/content': './ts/content.ts',
    'js/options': './ts/options.ts',
    'js/popup': './ts/popup.ts',
    'manifest.json': './manifest.json.js',
  },
  mode: env,
  module: {
    rules: [
      {
        test: /\.json\.js$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]',
            },
          },
          'val-loader',
          ifdefLoader,
        ],
      },
      {
        test: /\.png/,
        use: ['url-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
          ifdefLoader,
        ],
      },
      {
        test: /\.svg(\?.*)?$/,
        use: ['url-loader', 'svg-transform-loader'],
      },
      {
        test: /\.ts$/,
        use: ['ts-loader', ifdefLoader],
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', browser, env),
  },
  plugins: [
    new CopyPlugin([
      './_locales/**/messages.json',
      './img/*.png',
      './options.html',
      './popup.html',
    ]),
    new FixStyleOnlyEntriesPlugin({
      extensions: ['json.js', 'scss'],
      silent: true,
    }),
    new LicenseCheckerWebpackPlugin({
      override: {
        'dialog-polyfill@0.5.0': {
          licenseName: 'BSD-3-Clause',
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts'],
  },
  stats: {
    children: false,
  },
};
