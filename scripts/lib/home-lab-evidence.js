'use strict';

const crypto = require('node:crypto');
const path = require('node:path');
const microsoft365Evidence = require('../build/generate-m365-evidence-organization.js');

const TEXT_EXTENSIONS = new Set([
  '.csv', '.tsv', '.json', '.xml', '.svg', '.html', '.htm', '.md', '.txt',
  '.ps1', '.psd1', '.psm1', '.js', '.mjs', '.cjs', '.sh', '.yaml', '.yml',
  '.log', '.patch', '.ini', '.conf', '.cfg', '.sha256'
]);
const BINARY_RESTRICTED_EXTENSIONS = new Set(['.pfx', '.p12', '.key', '.pem', '.kdbx']);

const technologyRules = [
  ['backup-recovery', /\bbackup\b|restore|recovery|archive|snapshot|vma\b|zstd|retention/i],
  ['pfsense', /pfsense|openvpn|firewall policy|firewall rule|nat\b/i],
  ['linux', /linux|ubuntu|sssd|realmd|adcli|systemd|ssh\b|rsyslog/i],
  ['active-directory', /active directory|\bad ds\b|domain controller|dc01|fsmo|organizational unit|\bou\b|group policy|\bgpo\b|ldap|kerberos|sysvol|netlogon|rootdse/i],
  ['dns-dhcp', /\bdns\b|\bdhcp\b|name resolution|forward lookup|reverse lookup|srv record/i],
  ['windows-clients', /windows client|windows 11|ws01|secure channel|mapped drive|rdp\b|nla\b/i],
  ['windows-server', /windows server|server role|rsat|winrm|server manager|powershell module/i],
  ['proxmox', /proxmox|qemu|virtual machine|\bvm\b|vmid|guest agent|storage status|bridge/i],
  ['networking', /network|connectivity|vlan|vpn\b|routing|route\b|subnet|tcp\b|icmp|ip configuration|segmentation/i],
  ['monitoring-logging', /monitor|logging|log collection|event log|alert|telemetry|rsyslog/i],
  ['security', /security|hardening|isolation|integrity|checksum|least privilege|access control|policy validation/i],
  ['automation', /powershell|\.ps1\b|\.psd1\b|\.psm1\b|\.sh\b|automation|script|framework|repository validation/i],
  ['environment', /home lab|home-lab|environment|inventory|architecture|source of truth/i]
];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function toPosix(value) {
  return String(value).replaceAll('\\', '/').replace(/^\.\/+/, '');
}

function normalizeForTechnologyMatching(value) {
  return String(value).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function technologiesFor(value, fallback = 'environment') {
  const normalized = normalizeForTechnologyMatching(value);
  const matches = technologyRules.filter((rule) => rule[1].test(normalized)).map((rule) => rule[0]);
  return [...new Set(matches.length ? matches : [fallback])];
}

function evidenceType(relativePath) {
  const value = normalizeForTechnologyMatching(relativePath.toLowerCase());
  const ext = path.extname(relativePath).toLowerCase();
  if (['.ps1', '.psd1', '.psm1', '.js', '.mjs', '.cjs', '.sh'].includes(ext) && /(?:^|[\\/])(?:scripts|tests|artifacts[\\/]target local collection)(?:[\\/]|$)/i.test(relativePath)) return 'scripts';
  if (/manifest|checksum|hash inventory/.test(value) || ext === '.sha256') return 'manifests';
  if (/screenshot|screen shot/.test(value) || ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) return 'screenshots';
  if (/validation|validated state|health check|diagnostic|result/.test(value)) return 'validation';
  if (/inventory|system state|platform state|configuration summary|version/.test(value)) return 'inventories';
  if (/report|summary|analysis|case study|walkthrough/.test(value)) return 'reports';
  if (/configuration|config|policy|baseline|template|topology|architecture/.test(value)) return 'configuration';
  if (/script output|command output|console|transcript|execution|session metadata/.test(value) || ['.log', '.txt'].includes(ext)) return 'scripts-output';
  if (/test|check/.test(value)) return 'testing';
  if (['.csv', '.tsv', '.json', '.xml', '.yaml', '.yml'].includes(ext)) return 'exports';
  return 'documentation';
}

function normalizeDestinationPath(relativePath) {
  const parts = toPosix(relativePath).split('/');
  if (!parts.length || parts.some((part) => !part || part === '.' || part === '..')) {
    throw new Error('Unsafe Home Lab logical destination source path: ' + relativePath);
  }
  return parts.map((part) => {
    const normalized = part.normalize('NFKC').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!normalized || normalized === '.' || normalized === '..') throw new Error('Unsafe Home Lab logical destination segment: ' + part);
    return normalized;
  }).join('/');
}

function logicalDestination(technology, type, collection, relativeSourcePath) {
  const folder = type === 'documentation' ? 'documentation' : type === 'scripts' ? 'scripts' : 'evidence/' + type;
  return 'content/home-lab/' + technology + '/' + folder + '/' + collection + '/' + normalizeDestinationPath(relativeSourcePath);
}

function summarizeFindings(findings) {
  const groups = new Map();
  for (const finding of findings) {
    const key = [finding.type, finding.severity, finding.reviewStatus, finding.exceptionId || ''].join('|');
    if (!groups.has(key)) {
      groups.set(key, {
        type: finding.type,
        severity: finding.severity,
        reviewStatus: finding.reviewStatus,
        exceptionId: finding.exceptionId,
        occurrences: 0,
        lines: [],
        valueFingerprints: []
      });
    }
    const group = groups.get(key);
    group.occurrences += 1;
    if (!group.lines.includes(finding.line)) group.lines.push(finding.line);
    if (!group.valueFingerprints.includes(finding.fingerprint)) group.valueFingerprints.push(finding.fingerprint);
  }
  return [...groups.values()].map((group) => ({
    ...group,
    lines: group.lines.slice(0, 50).sort((a, b) => a - b),
    valueFingerprints: group.valueFingerprints.sort()
  })).sort((a, b) => a.severity.localeCompare(b.severity) || a.type.localeCompare(b.type) || a.reviewStatus.localeCompare(b.reviewStatus));
}

function reviewArtifact(buffer, sourcePath, publicRoute, exceptionManifest, matchedExceptionIds) {
  const ext = path.extname(sourcePath).toLowerCase();
  if (BINARY_RESTRICTED_EXTENSIONS.has(ext)) {
    return {
      status: 'manual-review-required',
      highSeverityFindings: 1,
      identifierFindings: 0,
      manualReviewRequired: true,
      findings: [{type: 'restricted-binary-container', severity: 'high', reviewStatus: 'review-required', exceptionId: null, occurrences: 1, lines: [], valueFingerprints: []}]
    };
  }
  if (!TEXT_EXTENSIONS.has(ext)) {
    return {status: 'manual-review-required', highSeverityFindings: 0, identifierFindings: 0, manualReviewRequired: true, findings: []};
  }
  const rawFindings = microsoft365Evidence.scanText(buffer, sourcePath, exceptionManifest, Boolean(publicRoute), matchedExceptionIds);
  const highSeverityFindings = rawFindings.filter((finding) => finding.severity === 'high').length;
  const identifierFindings = rawFindings.filter((finding) => finding.severity === 'medium').length;
  const reviewed = rawFindings.some((finding) => finding.reviewStatus === 'reviewed-exception');
  return {
    status: reviewed ? 'reviewed-exceptions-applied' : 'automated-no-high-severity-findings',
    highSeverityFindings,
    identifierFindings,
    manualReviewRequired: false,
    findings: summarizeFindings(rawFindings)
  };
}

module.exports = {
  TEXT_EXTENSIONS,
  evidenceType,
  logicalDestination,
  normalizeDestinationPath,
  normalizeForTechnologyMatching,
  reviewArtifact,
  sha256,
  technologiesFor,
  toPosix
};
