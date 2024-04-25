import fs from "node:fs/promises";
import util from "node:util";
import licenseChecker from "license-checker";

// https://github.com/juliangruber/is-mobile?tab=readme-ov-file#license
const IS_MOBILE_LICENSE_TEXT = `(MIT)

Copyright (c) 2013 Julian Gruber <julian@juliangruber.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

async function main() {
  const packageInfos = (await util.promisify(licenseChecker.init)({
    customFormat: {
      name: "",
      licenseText: "",
    },
    direct: true,
    excludePackages: "ublacklist@0.0.0",
    production: true,
    start: ".",
  })) as Record<string, { name: string; licenseText: string }>;
  const thirdPartyNotices = Object.values(packageInfos)
    .sort(({ name: name1 }, { name: name2 }) =>
      name1 < name2 ? -1 : name1 > name2 ? 1 : 0,
    )
    .map(
      ({ name, licenseText }) =>
        `${name}\n\n${
          name === "is-mobile" ? IS_MOBILE_LICENSE_TEXT : licenseText
        }\n`,
    )
    .join("\n\n");
  await fs.writeFile("src/third-party-notices.txt", thirdPartyNotices);
}

await main();
