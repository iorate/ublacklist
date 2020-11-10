import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import glob from 'glob';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

class JsonJsPlugin {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.compilation.tap('JsonJsPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'JsonJsPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
        },
        () => {
          for (const { name, source } of compilation.getAssets()) {
            if (name.endsWith('.json.js')) {
              let exportAsJSON: unknown;
              eval(source.source().toString());
              compilation.emitAsset(
                name.slice(0, -3),
                new webpack.sources.RawSource(JSON.stringify(exportAsJSON, null, 2), false),
              );
              compilation.deleteAsset(name);
            }
          }
        },
      );
    });
  }
}

const browser = process.env.BROWSER === 'firefox' ? 'firefox' : 'chrome';
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const ifWebpackLoader = {
  loader: 'if-webpack-loader',
  options: {
    CHROME: browser === 'chrome',
    FIREFOX: browser === 'firefox',
    DEBUG: env === 'development',
  },
};

const config: webpack.Configuration = {
  cache: {
    buildDependencies: {
      config: [__filename],
    },
    type: 'filesystem',
  },
  context: path.resolve(__dirname, 'src'),
  devtool: env === 'development' ? 'inline-source-map' : false,
  entry: {
    // '_locales/en/messages.json': './_locales/en/messages.json.ts',
    // ...
    ...Object.fromEntries(
      glob.sync('./**/*.json.ts', { cwd: 'src' }).map(name => [name.slice(2, -3), name]),
    ),
    'scripts/background': './scripts/background.ts',
    'scripts/content-script': './scripts/content-script.tsx',
    'scripts/options': './scripts/options.tsx',
    'scripts/popup': './scripts/popup.tsx',
  },
  mode: env,
  module: {
    rules: [
      {
        test: /\.png$/,
        use: ['url-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          'to-string-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false,
            },
          },
          'sass-loader',
          ifWebpackLoader,
        ],
      },
      {
        test: /\.svg(\?.*)?$/,
        use: ['url-loader', 'svg-transform-loader'],
      },
      {
        test: /\.tsx?$/,
        use: ['ts-loader', ifWebpackLoader],
      },
    ],
  },
  name: browser,
  optimization: {
    minimizer: [
      new TerserPlugin({
        exclude: /scripts\/content-script-required\.js/,
      }) as webpack.WebpackPluginInstance,
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist', browser, env),
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: ['./images/**/*', './scripts/**/*.js', './**/*.html'],
    }),
    new DotEnv({
      defaults: true,
      systemvars: true,
    }),
    new JsonJsPlugin(),
    new LicenseWebpackPlugin({
      additionalModules: [
        {
          name: '@mdi/svg',
          directory: path.resolve(__dirname, 'node_modules/@mdi/svg'),
        },
        {
          name: 'bulma',
          directory: path.resolve(__dirname, 'node_modules/bulma'),
        },
        {
          name: 'bulma-checkradio',
          directory: path.resolve(__dirname, 'node_modules/bulma-checkradio'),
        },
        {
          name: 'bulma-switch',
          directory: path.resolve(__dirname, 'node_modules/bulma-switch'),
        },
      ],
      licenseTextOverrides: {
        // https://github.com/juliangruber/is-mobile/blob/master/README.md
        'is-mobile': `(MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`,
      },
      perChunkOutput: false,
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
};

export default config;
