'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'content/site/preview/pages-08.json'), 'utf8'));
const routes = {'architecture': 'architecture.html', 'home-lab': 'home-lab-overview.html'};
const required = ['HVHOST01', 'APP01', 'VMM01', 'SYNC01', 'macOS Monterey', 'Windows Admin Center', 'Microsoft Entra ID', 'Microsoft 365', 'Azure Arc'];
for (const [key, file] of Object.entries(routes)) {
  test(file + ' has documented components in authoritative source and output', () => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const body = source[key].body;
    for (const system of required) {
      assert.ok(body.includes(system), key + ' missing source component ' + system);
      assert.ok(html.includes(system), file + ' missing published component ' + system);
    }
    assert.match(body, /not necessarily separate Proxmox guests/i);
    assert.match(html, /not necessarily separate Proxmox guests/i);
    assert.match(body, /placement is not (?:established|asserted)/i);
  });
}
test('No undocumented Proxmox placement assertion for ancillary systems', () => {
  for (const key of Object.keys(routes)) {
    const fragment = source[key].body.match(/<section class="section" aria-labelledby="extended-systems-title">([\s\S]*?)<\/section>/);
    assert.ok(fragment, key + ' missing bounded additional systems section');
    assert.doesNotMatch(fragment[1], /(?:VM 500|VM 600|VM 700|VLAN [0-9]+|192\.168\.|10\.10\.)/);
  }
});
