import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import DotEnv from 'dotenv-webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import glob from 'glob';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import prettier from 'prettier';
import webpack from 'webpack';

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

// Generate *.json from *.json.js
class ExportAsJSONPlugin implements webpack.WebpackPluginInstance {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap('ExportAsJSONPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ExportAsJSONPlugin',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED,
        },
        assets => {
          for (const [name, source] of Object.entries(assets)) {
            if (name.endsWith('.json.js')) {
              compilation.deleteAsset(name);
              const exportAsJSON = (filename: string, value: unknown): void => {
                compilation.emitAsset(
                  filename,
                  new webpack.sources.RawSource(JSON.stringify(value, null, 2)),
                );
              };
              // eslint-disable-next-line @typescript-eslint/no-implied-eval
              new Function('exportAsJSON', source.source().toString())(exportAsJSON);
            }
          }
        },
      );
    });
  }
}

// Format *.html, *.js, and *.json
class PrettierPlugin implements webpack.WebpackPluginInstance {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap('PrettierPlugin', compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: 'PrettierPlugin',
          // Run after html-webpack-plugin
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE + 1,
        },
        assets => {
          const options = prettier.resolveConfig.sync(__filename);
          if (!options) {
            throw new Error('No prettier config was found');
          }
          for (const [name, source] of Object.entries(assets)) {
            const parser: prettier.RequiredOptions['parser'] | null = name.endsWith('.html')
              ? 'html'
              : name.endsWith('.js')
              ? (text, { babel }) => {
                  const ast = babel(text) as { comments?: unknown };
                  delete ast.comments;
                  return ast;
                }
              : name.endsWith('.json')
              ? 'json'
              : null;
            if (parser) {
              compilation.updateAsset(
                name,
                new webpack.sources.RawSource(
                  prettier.format(source.source().toString(), { ...options, parser }),
                ),
              );
            }
          }
        },
      );
    });
  }
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
        glob.sync('./**/*.json.ts', { cwd: 'src' }).map(name => [name.slice(0, -3), name]),
      ),
      [browser === 'chrome-mv3' ? 'background' : 'scripts/background']: './scripts/background.ts',
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

      new LicenseWebpackPlugin({
        excludedPackageTest: packageName => packageName === 'ublacklist',
        licenseFileOverrides: {
          'preact-compat': '../LICENSE',
          'preact-hooks': '../LICENSE',
        },
        licenseTextOverrides: {
          // https://github.com/juliangruber/is-mobile/blob/master/README.md
          'is-mobile': `(MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`,
        },
        licenseTypeOverrides: {
          goober: 'MIT',
        },
        perChunkOutput: false,
      }) as unknown as webpack.WebpackPluginInstance,

      ...(mode === 'production' ? [new PrettierPlugin()] : []),
    ],

    resolve: {
      alias: {
        dayjs: 'dayjs/esm',
        goober: path.resolve(__dirname, 'node_modules/goober/src'),
        mpsl: path.resolve(__dirname, 'node_modules/mpsl/src/mpsl.ts'),
        preact$: path.resolve(__dirname, 'node_modules/preact/src'),
        'preact/hooks': path.resolve(__dirname, 'node_modules/preact/hooks/src'),
        react: path.resolve(__dirname, 'node_modules/preact/compat/src'),
        'react-dom': path.resolve(__dirname, 'node_modules/preact/compat/src'),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  };
};
