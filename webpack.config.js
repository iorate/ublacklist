const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

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
    'manifest.json': './manifest.json.js',
    'js/background': './ts/background.ts',
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
    ]),
    new FixStyleOnlyEntriesPlugin({
      extensions: ['json.js'],
      silent: true,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
