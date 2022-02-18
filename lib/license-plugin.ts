import fs from 'fs';
import path from 'path';
import { globby } from 'globby';
import webpack from 'webpack';

type Options = {
  filename: string;
  overrides: Readonly<Record<string, string>>;
};

export type LicensePluginOptions = Partial<Options>;

export class LicensePlugin implements webpack.WebpackPluginInstance {
  private readonly options: Options;

  constructor(options: Readonly<LicensePluginOptions> = {}) {
    this.options = {
      filename: options.filename ?? 'third-party-notices.txt',
      overrides: options.overrides || {},
    };
  }

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap(LicensePlugin.name, compilation => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: LicensePlugin.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        () => this.processAssets(compilation),
      );
    });
  }

  private async processAssets(compilation: webpack.Compilation): Promise<void> {
    const stats = compilation.getStats().toJson({
      all: false,
      modules: true,
      cachedModules: true,
      nestedModules: true,
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const packages = this.getPackages(stats.modules!);
    const licenses = await this.readLicenses(compilation, packages);
    this.writeLicenses(compilation, licenses);
  }

  private getPackages(modules: readonly webpack.StatsModule[]): Record<string, string> {
    let packages: Record<string, string> = {};
    for (const module of modules) {
      const filePath = module.nameForCondition;
      if (filePath != null && path.isAbsolute(filePath)) {
        packages = { ...packages, ...this.getSinglePackage(filePath) };
      }
      if (module.modules) {
        packages = { ...packages, ...this.getPackages(module.modules) };
      }
    }
    return packages;
  }

  // getSinglePackage('/path/to/node_modules/@scope/package/path/to/module.js')
  // => { '@scope/package': '/path/to/node_modules/@scope/package' }
  // getSinglePackage('/path/to/node_modules/package/node_modules/nested-package/index.js')
  // => { 'nested-package': '/path/to/node_modules/package/node_modules/nested-package' }
  private getSinglePackage(filePath: string): Record<string, string> {
    const parts = filePath.split(path.sep);
    const nmi = parts.lastIndexOf('node_modules');
    if (nmi === -1 || nmi + 1 >= parts.length) {
      return {};
    }
    if (parts[nmi + 1].startsWith('@')) {
      if (nmi + 2 >= parts.length) {
        return {};
      }
      return { [`${parts[nmi + 1]}/${parts[nmi + 2]}`]: parts.slice(0, nmi + 3).join(path.sep) };
    }
    return { [parts[nmi + 1]]: parts.slice(0, nmi + 2).join(path.sep) };
  }

  private async readLicenses(
    compilation: webpack.Compilation,
    packages: Readonly<Record<string, string>>,
  ): Promise<Record<string, string>> {
    const licensePromises = Object.entries(packages).map(async ([packageName, packagePath]) => {
      if (this.options.overrides[packageName]) {
        return [[packageName, this.options.overrides[packageName]] as const];
      }
      const licensePaths = await globby('license*', {
        cwd: packagePath,
        absolute: true,
        caseSensitiveMatch: false,
      });
      if (!licensePaths.length) {
        compilation.warnings.push(
          new webpack.WebpackError(`${LicensePlugin.name}: no license found for ${packageName}`),
        );
        return [];
      }
      const license = await fs.promises.readFile(licensePaths[0], 'utf8');
      return [[packageName, license] as const];
    });
    return Object.fromEntries((await Promise.all(licensePromises)).flat());
  }

  private writeLicenses(
    compilation: webpack.Compilation,
    licenses: Readonly<Record<string, string>>,
  ): void {
    const concatenatedLicenses = Object.keys(licenses)
      .sort()
      .map(packageName => {
        const license = licenses[packageName]
          .replace(/\r\n?/g, '\n')
          // Remove leading, trailing, and consecutive blank lines
          .replace(/^\n+|\n+($|(?=\n\n))/g, '');
        return `${packageName}\n\n${license}\n`;
      })
      .join('\n\n');
    compilation.emitAsset(
      this.options.filename,
      new webpack.sources.RawSource(concatenatedLicenses),
    );
  }
}
