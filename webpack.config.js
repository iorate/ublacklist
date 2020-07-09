const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const LicenseCheckerWebpackPlugin = require('license-checker-webpack-plugin');

const browser = process.env.BROWSER || 'chrome';
const env = process.env.NODE_ENV || 'development';

const ifdefLoader = {
  loader: 'ifdef-loader',
  options: {
    CHROMIUM: browser === 'chrome',
    DEBUG: env === 'development',
    'ifdef-triple-slash': false,
  },
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
    'manifest.json': './manifest.json.js',
    'scripts/background': './scripts/background.ts',
    'scripts/content-script': './scripts/content-script.tsx',
    'scripts/options': './scripts/options.tsx',
    'scripts/popup': './scripts/popup.tsx',
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
        test: /\.svg(\?.*)?$/,
        use: ['url-loader', 'svg-transform-loader'],
      },
      {
        test: /\.tsx?$/,
        use: ['ts-loader', ifdefLoader],
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist', browser, env),
  },
  plugins: [
    new CopyPlugin({
      patterns: ['./_locales/**/*', './images/**/*', './scripts/**/*.js', './**/*.html'],
    }),
    new FixStyleOnlyEntriesPlugin({
      extensions: ['json.js'],
      silent: true,
    }),
    new LicenseCheckerWebpackPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  stats: {
    children: false,
  },
};
