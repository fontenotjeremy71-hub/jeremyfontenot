'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');

function toPosix(value) {
  return value.replaceAll('\\', '/');
}

function walkFiles(directory, predicate, output = []) {
  if (!fs.existsSync(directory)) return output;
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walkFiles(absolute, predicate, output);
    else if (entry.isFile() && predicate(absolute)) output.push(absolute);
  }
  return output;
}

function publicationFiles() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/publication-manifest.json'), 'utf8'));
  const files = new Set();
  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (entry.isFile() && manifest.rootExtensions.includes(path.extname(entry.name).toLowerCase())) files.add(entry.name);
  }
  for (const directory of manifest.directories) {
    for (const absolute of walkFiles(path.join(root, directory), () => true)) files.add(toPosix(path.relative(root, absolute)));
  }
  return [...files].sort();
}

function publicHtmlFiles() {
  return publicationFiles().filter((file) => /\.html?$/i.test(file));
}

function routeSourceFiles() {
  return walkFiles(path.join(root, 'assets', 'js'), (file) => /^(?:routes-[^/\\]+|site|site-core|site-render)\.js$/i.test(path.basename(file)))
    .map((file) => toPosix(path.relative(root, file)))
    .sort();
}

module.exports = {publicHtmlFiles, publicationFiles, root, routeSourceFiles, toPosix};
