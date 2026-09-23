import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', 'playwright-report', 'test-results']);
const ignoredExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.pdf', '.zip']);
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['aws-access-key', /\bAKIA[0-9A-Z]{16}\b/],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/],
  ['generic-secret-assignment', /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"'\s]{16,}["']/i],
];

function collect(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return [];
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(absolute);
    if (ignoredExtensions.has(path.extname(entry.name).toLowerCase())) return [];
    return [absolute];
  });
}

const findings = [];
for (const file of collect(root)) {
  let contents;
  try { contents = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const [rule, pattern] of patterns) {
    if (pattern.test(contents)) findings.push(`${path.relative(root, file)} :: ${rule}`);
  }
}

if (findings.length) {
  console.error(`فشل فحص الأسرار (${findings.length}):`);
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log('نجح فحص الأسرار: لم تُكتشف أنماط أسرار شائعة في الملفات المتتبعة للفحص.');
