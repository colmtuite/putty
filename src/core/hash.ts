/**
 * Deterministic 52-bit hash of a string, as a base36 string (at most 11 chars).
 *
 * Two independent 32-bit hashes (djb2-xor and FNV-1a) are computed in one pass
 * and combined. 52 bits keeps the result an exact integer in a double while
 * making a collision between two declarations in one app vanishingly unlikely
 * (about 1 in 10^6 at 100,000 distinct declarations, versus ~5% at 20,000 with
 * a single 32-bit hash).
 */
export function hash(str: string): string {
  let a = 5381;
  let b = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    a = ((a << 5) + a) ^ c;
    b = Math.imul(b ^ c, 0x01000193);
  }
  const hi = (a >>> 0) & 0xfffff; // 20 bits
  const lo = b >>> 0; // 32 bits
  return (hi * 0x100000000 + lo).toString(36);
}

/**
 * Generate a class name from a style declaration
 */
export function generateClassName(
  property: string,
  value: string,
  breakpoint?: string,
  selector?: string
): string {
  const parts = [property, value];
  if (breakpoint) parts.push(breakpoint);
  if (selector) parts.push(selector);
  return `z${hash(parts.join(':'))}`;
}

