import { extract, mayContainCx } from './extract.ts';
import { rulesFor, type Rule } from './css.ts';

export interface TransformResult {
  /** Transformed source. Identical to the input when `changed` is false. */
  code: string;
  /** Rules for every cx() call in the file (not deduplicated). */
  rules: Rule[];
  /** False when the file has no putty import. */
  changed: boolean;
}

/**
 * Replace every `cx({...})` with a literal `{ className: "..." }` and remove the
 * now-unused `cx` import. Line numbers are preserved so stack traces and error
 * overlays keep pointing at the right place without a source map.
 *
 * Throws `ExtractError` (with file/line/column) for anything that can't be
 * compiled statically.
 */
export function transformSource(code: string, fileName: string): TransformResult {
  if (!mayContainCx(code)) return { code, rules: [], changed: false };

  const { import: cxImport, calls } = extract(code, fileName);
  if (!cxImport) return { code, rules: [], changed: false };

  const rules: Rule[] = [];
  const edits: Array<{ start: number; end: number; text: string }> = [];

  for (const call of calls) {
    const callRules = rulesFor(call.styles);
    rules.push(...callRules);
    const classNames = [...new Set(callRules.map((r) => r.className))].join(' ');
    edits.push({
      start: call.start,
      end: call.end,
      text: `{ className: "${classNames}" }`,
    });
  }

  if (cxImport.hasOtherSpecifiers) {
    edits.push({ start: cxImport.start, end: cxImport.end, text: cxImport.withoutCx });
  } else {
    edits.push({ start: cxImport.start, end: cxImport.end, text: '' });
  }

  return { code: applyEdits(code, edits), rules, changed: true };
}

/**
 * A line-accurate identity source map. Because `transformSource` preserves line
 * numbers, mapping each line to itself is correct and cheap; it keeps bundlers
 * from warning about a missing map without pulling in a source-map library.
 */
export function lineIdentityMap(originalCode: string, fileName: string): {
  version: 3;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
} {
  const lines = originalCode.split('\n').length;
  // Segment [genCol=0, srcIdx=0, srcLineDelta, srcCol=0]: first line "AAAA", then "AACA" (line +1).
  const mappings = lines === 0 ? '' : ['AAAA', ...new Array<string>(lines - 1).fill('AACA')].join(';');
  return { version: 3, file: fileName, sources: [fileName], sourcesContent: [originalCode], names: [], mappings };
}

/**
 * Apply non-overlapping edits, padding each replacement with the newlines it
 * removed so every original line keeps its line number.
 */
function applyEdits(code: string, edits: Array<{ start: number; end: number; text: string }>): string {
  edits.sort((a, b) => a.start - b.start);
  let out = '';
  let cursor = 0;
  for (const { start, end, text } of edits) {
    out += code.slice(cursor, start);
    const removed = code.slice(start, end);
    const removedLines = removed.split('\n').length - 1;
    const keptLines = text.split('\n').length - 1;
    out += text + '\n'.repeat(Math.max(0, removedLines - keptLines));
    cursor = end;
  }
  return out + code.slice(cursor);
}
