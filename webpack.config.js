const glob = require('glob');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const DotEnv = require('dotenv-webpack');
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
    json: glob.sync('./**/*.json.ts', { cwd: 'src' }),
    'scripts/background': './scripts/background.ts',
    'scripts/content-script': './scripts/content-script.tsx',
    'scripts/options': './scripts/options.tsx',
    'scripts/popup': './scripts/popup.tsx',
  },
  mode: env,
  module: {
    rules: [
      {
        test: /\.json.ts$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name]',
            },
          },
          'val-loader',
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json.json',
              onlyCompileBundledFiles: true,
            },
          },
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
  performance: {
    hints: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: ['./images/**/*', './scripts/**/*.js', './**/*.html'],
    }),
    new DotEnv({
      defaults: true,
      systemvars: true,
    }),
    new FixStyleOnlyEntriesPlugin({
      extensions: ['.json.ts'],
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
