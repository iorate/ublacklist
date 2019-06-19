const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');

const browser = process.env.BROWSER || 'chrome';
const env = process.env.NODE_ENV || 'development';

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
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
          { loader: 'ifdef-loader', options: { BROWSER: browser } },
        ]
      },
    ]
  },
  optimization: { minimize: false },
  output: {
    path: path.resolve(__dirname, 'dist', browser, env),
    filename: '[name].js'
  },
  plugins: [
    new CopyPlugin([
      './_locales/**/messages.json',
    ]),
    new FixStyleOnlyEntriesPlugin({ extensions: ['json.js'] }),
  ],
};
