import fs from 'node:fs';
import path from 'node:path';
import { extract, mayContainCx } from './extract.ts';
import { rulesFor, RuleSet, type Rule } from './css.ts';

export const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts'];
export const SOURCE_GLOB = `**/*.{${SOURCE_EXTENSIONS.map((e) => e.slice(1)).join(',')}}`;

export const DEFAULT_EXCLUDE = [
  'node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.next', '.turbo', '.vercel',
  '.cache', '.output', '.svelte-kit', '.nuxt',
];

export interface ScanOptions {
  /** Files or directories to scan, relative to `cwd`. Default: `['.']`. */
  content?: string[];
  /** Directory names to skip anywhere in the tree. */
  exclude?: string[];
  cwd?: string;
}

export interface ScanResult {
  css: string;
  rules: Rule[];
  /** Absolute paths of every source file considered (for dependency tracking). */
  files: string[];
  /** Absolute paths of every directory walked (for dependency tracking). */
  dirs: string[];
}

interface CacheEntry {
  mtimeMs: number;
  size: number;
  rules: Rule[];
}

/** Per-process cache so rebuilds only re-parse files that changed. */
const cache = new Map<string, CacheEntry>();

/**
 * Walk the project, extract every `cx()` call, and render the combined stylesheet.
 */
export function scan(options: ScanOptions = {}): ScanResult {
  const cwd = options.cwd ?? process.cwd();
  const exclude = new Set(options.exclude ?? DEFAULT_EXCLUDE);
  const roots = (options.content ?? ['.']).map((p) => path.resolve(cwd, p));

  const files: string[] = [];
  const dirs: string[] = [];
  for (const root of roots) walk(root, exclude, files, dirs);

  const set = new RuleSet();
  for (const file of files) set.add(rulesForFile(file));

  return { css: set.toCSS(), rules: set.values(), files, dirs };
}

/** Extract rules for one file, using the mtime cache. */
export function rulesForFile(file: string): Rule[] {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(file);
  } catch {
    cache.delete(file);
    return [];
  }

  const hit = cache.get(file);
  if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.rules;

  const code = fs.readFileSync(file, 'utf8');
  let rules: Rule[] = [];
  if (mayContainCx(code)) {
    const { calls } = extract(code, file);
    rules = calls.flatMap((c) => rulesFor(c.styles));
  }
  cache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, rules });
  return rules;
}

function walk(entry: string, exclude: Set<string>, files: string[], dirs: string[]): void {
  let stat: fs.Stats;
  try {
    stat = fs.statSync(entry);
  } catch {
    return;
  }

  if (stat.isFile()) {
    if (SOURCE_EXTENSIONS.includes(path.extname(entry))) files.push(entry);
    return;
  }
  if (!stat.isDirectory()) return;

  dirs.push(entry);
  for (const dirent of fs.readdirSync(entry, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      if (exclude.has(dirent.name)) continue;
      walk(path.join(entry, dirent.name), exclude, files, dirs);
    } else if (dirent.isFile() && SOURCE_EXTENSIONS.includes(path.extname(dirent.name))) {
      files.push(path.join(entry, dirent.name));
    }
  }
}
