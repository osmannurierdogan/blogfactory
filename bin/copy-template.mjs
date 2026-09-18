import { cp, readdir } from 'node:fs/promises';
import path from 'node:path';

// Files/dirs that belong to this template's own tooling, build output, or
// secrets — never copied into a scaffolded project.
const IGNORE = new Set([
  'node_modules',
  '.git',
  'dist',
  '.netlify',
  '.astro',
  'bin',
  '.env',
  'pnpm-lock.yaml',
  'AGENTS.md',
  'CLAUDE.md',
  '.vscode',
]);

export async function copyTemplate(sourceDir, targetDir) {
  const entries = await readdir(sourceDir);
  for (const entry of entries) {
    if (IGNORE.has(entry)) continue;
    await cp(path.join(sourceDir, entry), path.join(targetDir, entry), { recursive: true });
  }
}
