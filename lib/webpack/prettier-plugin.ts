import prettier from 'prettier';
import webpack from 'webpack';

export class PrettierPlugin implements webpack.WebpackPluginInstance {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap(PrettierPlugin.name, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: PrettierPlugin.name,
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
        new webpack.WebpackError(`${PrettierPlugin.name}: no prettier config was found`),
      );
      return;
    }
    for (const [name, source] of Object.entries(assets)) {
      const parser: prettier.RequiredOptions['parser'] | null = name.endsWith('.js')
        ? (text, { meriyah }) => {
            const ast = meriyah(text) as { comments?: unknown };
            delete ast.comments;
            return ast;
          }
        : name.endsWith('.json')
        ? 'json'
        : name.endsWith('.html')
        ? 'html'
        : null;
      if (!parser) {
        continue;
      }
      const formattedCode = prettier.format(source.source().toString(), { ...options, parser });
      compilation.updateAsset(name, new webpack.sources.RawSource(formattedCode));
    }
  }
}
