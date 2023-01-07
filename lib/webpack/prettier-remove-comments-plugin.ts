import prettier from 'prettier';
import webpack from 'webpack';
import { removeCommentsPlugin } from '../prettier/remove-comments-plugin';

export class PrettierRemoveCommentsPlugin implements webpack.WebpackPluginInstance {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap(PrettierRemoveCommentsPlugin.name, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: PrettierRemoveCommentsPlugin.name,
          // Run after html-webpack-plugin
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE + 1,
        },
        assets => this.processAssets(compilation, assets),
      );
    });
  }

  private processAssets(
    compilation: webpack.Compilation,
    assets: Readonly<Record<string, webpack.sources.Source>>,
  ): void {
    const options = prettier.resolveConfig.sync(__filename);
    if (!options) {
      compilation.errors.push(
        new webpack.WebpackError(
          `${PrettierRemoveCommentsPlugin.name}: no prettier config was found`,
        ),
      );
      return;
    }
    for (const [name, source] of Object.entries(assets)) {
      const parser: string | null = name.endsWith('.js')
        ? 'meriyah-remove-comments'
        : name.endsWith('.json')
        ? 'json'
        : name.endsWith('.html')
        ? 'html'
        : null;
      if (parser == null) {
        continue;
      }
      const formattedCode = prettier.format(source.source().toString(), {
        ...options,
        parser,
        plugins: [removeCommentsPlugin],
      });
      compilation.updateAsset(name, new webpack.sources.RawSource(formattedCode));
    }
  }
}
