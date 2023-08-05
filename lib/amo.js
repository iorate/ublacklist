// @ts-check

const fs = require('node:fs');

const manifestJsonPath = 'dist/firefox/production/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
manifest.version = process.argv[2];
fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2), 'utf8');
