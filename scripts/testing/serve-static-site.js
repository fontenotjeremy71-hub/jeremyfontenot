'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {root, publicationFiles} = require('../lib/publication-inventory.js');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'config/publication-manifest.json')));
const allowed = new Set([...publicationFiles(), ...manifest.requiredRootFiles, ...manifest.optionalRootFiles]);
const types = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.pdf':'application/pdf','.ico':'image/x-icon'};
const server = http.createServer((request,response) => {
  let relative;
  try {
    relative = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname).slice(1);
    if (!relative || relative.endsWith('/')) relative += 'index.html';
  } catch { response.writeHead(400).end(); return; }
  if (!allowed.has(relative)) { response.writeHead(404).end('Not published'); return; }
  fs.readFile(path.join(root, relative), (error,data) => {
    if (error) response.writeHead(404).end('Not found');
    else response.writeHead(200, {'Content-Type':types[path.extname(relative)] || 'application/octet-stream'}).end(data);
  });
});
server.listen(Number(process.env.PORTFOLIO_TEST_PORT || 4173), '127.0.0.1');
process.on('SIGTERM', () => server.close());
