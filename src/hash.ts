/**
 * Generate a deterministic hash from a string
 * Uses djb2 algorithm - fast and produces good distribution
 */
export function hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  // Convert to base36 and take first 7 characters
  return (h >>> 0).toString(36).slice(0, 7);
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

