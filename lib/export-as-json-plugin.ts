import webpack from 'webpack';

export class ExportAsJSONPlugin implements webpack.WebpackPluginInstance {
  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap(ExportAsJSONPlugin.name, compilation => {
      compilation.hooks.processAssets.tap(
        {
          name: ExportAsJSONPlugin.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED,
        },
        assets => this.processAssets(compilation, assets),
      );
    });
  }

  private processAssets(
    compilation: webpack.Compilation,
    assets: Readonly<Record<string, webpack.sources.Source>>,
  ): void {
    for (const [name, source] of Object.entries(assets)) {
      if (name.endsWith('.json.js')) {
        compilation.deleteAsset(name);
        const exportAsJSON = (filename: string, value: unknown): void => {
          const json = JSON.stringify(value, null, 2);
          compilation.emitAsset(filename, new webpack.sources.RawSource(json));
        };
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        new Function('exportAsJSON', source.source().toString())(exportAsJSON);
      }
    }
  }
}
