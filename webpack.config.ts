import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { globbySync } from 'globby';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import { ExportAsJSONPlugin } from './lib/webpack/export-as-json-plugin';
import { LicensePlugin } from './lib/webpack/license-plugin';
import { PrettierPlugin } from './lib/webpack/prettier-plugin';

function getEnv<Value extends string>(
  env: Readonly<Record<string, unknown>>,
  key: string,
  possibleValues: readonly Value[],
): Value {
  const value = env[key];
  if (typeof value !== 'string' || !(possibleValues as readonly string[]).includes(value)) {
    throw new Error(`${key} shall be one of: ${possibleValues.join(', ')}`);
  }
  return value as Value;
}

export default (env: Readonly<Record<string, unknown>>): webpack.Configuration => {
  const browser = getEnv(env, 'browser', ['chrome', 'chrome-mv3', 'firefox', 'safari'] as const);
  const mode = getEnv(env, 'mode', ['development', 'production'] as const);
  const typecheck = getEnv(env, 'typecheck', ['notypecheck', 'typecheck'] as const);

  return {
    cache:
      mode === 'development'
        ? {
            buildDependencies: {
              config: [__filename],
            },
            type: 'filesystem',
          }
        : false,

    context: path.resolve(__dirname, 'src'),

    devtool:
      mode === 'development'
        ? browser === 'chrome-mv3'
          ? 'inline-cheap-source-map'
          : 'eval'
        : false,

    entry: {
      ...Object.fromEntries(
        globbySync('**/*.json.ts', { cwd: 'src' }).map(
          // 'locales/en.json.ts' => ['locales/en.json', './locales/en.json.ts']
          filePath => [filePath.slice(0, -3), `./${filePath}`],
        ),
      ),
      'scripts/background': './scripts/background.ts',
      'scripts/content-script': './scripts/content-script.tsx',
      'scripts/options': './scripts/options.tsx',
      'scripts/popup': './scripts/popup.tsx',
    },

    mode,

    module: {
      rules: [
        {
          test: /\.svg$/,
          type: 'asset/inline',
        },
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'esbuild-loader',
              options: {
                loader: 'tsx',
                target: 'es2019',
              },
            },
            {
              loader: 'if-webpack-loader',
              options: {
                CHROME: browser === 'chrome' || browser === 'chrome-mv3',
                CHROME_MV3: browser === 'chrome-mv3',
                FIREFOX: browser === 'firefox',
                SAFARI: browser === 'safari',
                DEVELOPMENT: mode === 'development',
                PRODUCTION: mode === 'production',
              },
            },
          ],
        },
      ],
    },

    name: browser,

    optimization: {
      // https://developer.chrome.com/docs/webstore/review-process/
      // Minification is allowed, but it can also make reviewing extension code more difficult.
      // Where possible, consider submitting your code as authored.
      minimize: false,
    },

    output: {
      path: path.resolve(__dirname, 'dist', browser, mode),
    },

    performance: {
      hints: false,
    },

    plugins: [
      new CopyPlugin({
        patterns: ['./icons/*.png', './scripts/*.js'],
      }),
      new DotEnv({
        defaults: true,
        silent: true,
        systemvars: true,
      }),
      new ExportAsJSONPlugin(),
      ...(typecheck === 'typecheck'
        ? [
            new ForkTsCheckerWebpackPlugin({
              typescript: {
                configFile: path.resolve(__dirname, 'tsconfig.json'),
              },
            }),
          ]
        : []),
      new HtmlWebpackPlugin({
        chunks: ['scripts/options'],
        filename: 'pages/options.html',
        meta: {
          'color-scheme': 'dark light',
          viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
        },
        minify: false,
        title: 'uBlacklist Options',
      }),
      new HtmlWebpackPlugin({
        chunks: ['scripts/popup'],
        filename: 'pages/popup.html',
        meta: {
          'color-scheme': 'dark light',
          viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
        },
        minify: false,
        title: 'uBlacklist Popup',
      }),
      ...(mode === 'production'
        ? [
            new LicensePlugin({
              overrides: {
                // https://github.com/juliangruber/is-mobile/blob/master/README.md
                'is-mobile': `(MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,
              },
            }),
            new PrettierPlugin(),
          ]
        : []),
    ],

    resolve: {
      alias: {
        dayjs: 'dayjs/esm',
        react: 'preact/compat',
        'react-dom': 'preact/compat',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };
};
