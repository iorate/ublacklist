import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import glob from 'glob';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

const browser = process.env.BROWSER as 'chrome' | 'firefox';
const env = process.env.NODE_ENV as 'development' | 'production';

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
    ...Object.fromEntries(glob.sync('./**/*.json.ts', { cwd: 'src' }).map(name => [name, name])),
    'scripts/background': './scripts/background.ts',
    'scripts/content-script': './scripts/content-script.tsx',
    'scripts/options': './scripts/options.tsx',
    'scripts/popup': './scripts/popup.tsx',
  },

  mode: env,

  module: {
    rules: [
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
        ],
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
      },
      {
        test: /\.tsx?$/,
        use: [
          'ts-loader',
          {
            loader: 'if-webpack-loader',
            options: {
              CHROME: browser === 'chrome',
              FIREFOX: browser === 'firefox',
              DEVELOPMENT: env === 'development',
              PRODUCTION: env === 'production',
            },
          },
        ],
      },
    ],
  },

  name: browser,

  optimization: {
    minimizer: [
      (new TerserPlugin({
        exclude: /scripts\/content-script-required\.js/,
      }) as unknown) as webpack.WebpackPluginInstance,
    ],
  },

  output: {
    path: path.resolve(__dirname, 'dist', browser, env),
  },

  plugins: [
    (new CleanWebpackPlugin() as unknown) as webpack.WebpackPluginInstance,

    new CopyPlugin({
      patterns: ['./images/**/*.png', './scripts/**/*.js'],
    }),

    new DotEnv({
      defaults: true,
      systemvars: true,
    }),

    (new HtmlWebpackPlugin({
      chunks: ['scripts/options'],
      filename: 'html/options.html',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      title: 'uBlacklist Options',
    }) as unknown) as webpack.WebpackPluginInstance,

    (new HtmlWebpackPlugin({
      chunks: ['scripts/popup'],
      filename: 'html/popup.html',
      meta: {
        viewport: 'width=device-width, initial-scale=1',
      },
      title: 'uBlacklist Popup',
    }) as unknown) as webpack.WebpackPluginInstance,

    // JsonPlugin: *.json.ts.js -> *.json
    {
      apply(compiler: webpack.Compiler): void {
        compiler.hooks.compilation.tap('JsonPlugin', compilation => {
          compilation.hooks.processAssets.tap(
            {
              name: 'JsonPlugin',
              stage: webpack.Compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
            },
            assets => {
              for (const [name, source] of Object.entries(assets)) {
                if (name.endsWith('.json.ts.js')) {
                  delete assets[name];
                  const exportAsJson = (filename: string, value: unknown): void => {
                    assets[filename] = new webpack.sources.RawSource(
                      JSON.stringify(value, null, 2),
                    );
                  };
                  // eslint-disable-next-line @typescript-eslint/no-implied-eval
                  new Function('exportAsJson', source.source().toString())(exportAsJson);
                }
              }
            },
          );
        });
      },
    },

    (new LicenseWebpackPlugin({
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
    }) as unknown) as webpack.WebpackPluginInstance,
  ],

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};

export default config;
