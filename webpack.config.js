const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const LicenseCheckerWebpackPlugin = require('license-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const ENGINE_IDS = ['startpage'];

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

const config = {
  context: path.resolve(__dirname, 'src'),
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
    'manifest.json': './manifest.json.js',
    'scripts/background': './scripts/background.ts',
    'scripts/engines/google': './scripts/engines/google.ts',
    'scripts/content': './scripts/content.ts',
    'scripts/options': './scripts/options.ts',
    'scripts/popup': './scripts/popup.ts',
    'styles/content': './styles/content.scss',
    'styles/engines/google': './styles/engines/google.scss',
    'styles/options': './styles/options.scss',
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
      './_locales/**/*',
      './images/**/*',
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

for (const engineId of ENGINE_IDS) {
  config.entry[`scripts/engines/${engineId}`] = `./scripts/engines/${engineId}.ts`;
  config.entry[`styles/engines/${engineId}`] = `./styles/engines/${engineId}.scss`;
}

module.exports = config;
