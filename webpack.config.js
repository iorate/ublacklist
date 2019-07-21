const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const LicenseCheckerWebpackPlugin = require('license-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const browser = process.env.BROWSER || 'chrome';
const env = process.env.NODE_ENV || 'development';

const ifdefOptions = {
  BROWSER: browser,
  ENV: env,
  'ifdef-triple-slash': false,
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
    'css/content': './sass/content.sass',
    'css/options': './sass/options.sass',
    'css/popup': './sass/popup.sass',
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
          { loader: 'file-loader', options: { name: '[name]' } },
          { loader: 'val-loader' },
          { loader: 'ifdef-loader', options: ifdefOptions },
        ],
      },
      {
        test: /\.sass$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
          { loader: 'ifdef-loader', options: ifdefOptions },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          { loader: 'url-loader' },
        ],
      },
      {
        test: /\.ts$/,
        use: [
          { loader: 'ts-loader' },
          { loader: 'ifdef-loader', options: ifdefOptions },
        ],
      },
    ]
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
      extensions: [
        'json.js',
        'sass',
      ],
      silent: true,
    }),
    new LicenseCheckerWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  resolve: {
    extensions: [
      '.js',
      '.ts',
    ],
  },
};
