const fs = require('fs-extra');

process.env.BROWSER = process.env.BROWSER || 'chrome';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const distDir = `./dist/${process.env.BROWSER}/${process.env.NODE_ENV}`;
fs.ensureDirSync(distDir);

// _locales
fs.copySync('./src/_locales', `${distDir}/_locales`);

// manifest.json
const manifest = require('./src/manifest');
fs.writeFileSync(`${distDir}/manifest.json`, JSON.stringify(manifest, null, 2));
