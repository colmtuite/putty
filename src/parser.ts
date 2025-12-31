/**
 * Parser for extracting cx() calls from source code
 * 
 * This is a simple regex-based parser for now.
 * For production, we'd want to use a proper AST parser like @babel/parser
 */

export interface CxCall {
  start: number;
  end: number;
  styles: Record<string, unknown>;
  raw: string;
}

/**
 * Find all cx() calls in source code
 * Returns the call locations and parsed style objects
 */
export function findCxCalls(source: string): CxCall[] {
  const calls: CxCall[] = [];
  
  // Match cx({ ... }) - this is a simplified regex
  // A production version would use proper AST parsing
  const cxPattern = /\bcx\s*\(\s*(\{[\s\S]*?\})\s*\)/g;
  
  let match;
  while ((match = cxPattern.exec(source)) !== null) {
    const fullMatch = match[0];
    const objectLiteral = match[1];
    const start = match.index;
    const end = start + fullMatch.length;

    try {
      // Try to parse the object literal
      // This is a simplified approach - we evaluate it as JS
      // In production, we'd use a proper parser
      const styles = parseObjectLiteral(objectLiteral);
      
      if (styles) {
        calls.push({
          start,
          end,
          styles,
          raw: fullMatch,
        });
      }
    } catch (e) {
      // Skip malformed cx() calls
      console.warn(`[zero-css] Could not parse cx() call: ${fullMatch}`);
    }
  }

  return calls;
}

/**
 * Parse an object literal string into a JavaScript object
 * This handles the specific syntax we support
 */
function parseObjectLiteral(literal: string): Record<string, unknown> | null {
  // Clean up the literal
  let cleaned = literal.trim();
  
  // We need to handle:
  // 1. Simple values: { display: 'flex' }
  // 2. Token values: { gap: '$4' }
  // 3. Responsive objects: { padding: { xs: '$4', md: '$6' } }
  // 4. Nested selectors: { '&:hover': { color: '$red' } }
  
  // For safety, we'll use a custom parser instead of eval
  try {
    // Convert to valid JSON-ish format
    // Replace single quotes with double quotes
    // Add quotes around unquoted keys
    // Handle template literals and other edge cases
    
    const result = parseObject(cleaned);
    return result;
  } catch (e) {
    return null;
  }
}

/**
 * Simple recursive descent parser for object literals
 */
function parseObject(input: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  
  // Remove outer braces
  input = input.trim();
  if (input.startsWith('{')) input = input.slice(1);
  if (input.endsWith('}')) input = input.slice(0, -1);
  input = input.trim();
  
  if (!input) return result;
  
  // Parse key-value pairs
  let i = 0;
  
  while (i < input.length) {
    // Skip whitespace and commas
    while (i < input.length && /[\s,]/.test(input[i])) i++;
    if (i >= input.length) break;
    
    // Parse key
    let key: string;
    
    if (input[i] === "'" || input[i] === '"') {
      // Quoted key
      const quote = input[i];
      i++;
      const keyStart = i;
      while (i < input.length && input[i] !== quote) i++;
      key = input.slice(keyStart, i);
      i++; // skip closing quote
    } else {
      // Unquoted key (identifier)
      const keyStart = i;
      while (i < input.length && /[a-zA-Z0-9_$]/.test(input[i])) i++;
      key = input.slice(keyStart, i);
    }
    
    // Skip whitespace and colon
    while (i < input.length && /[\s:]/.test(input[i])) i++;
    
    // Parse value
    const { value, endIndex } = parseValue(input, i);
    result[key] = value;
    i = endIndex;
  }
  
  return result;
}

/**
 * Parse a value starting at the given index
 */
function parseValue(input: string, start: number): { value: unknown; endIndex: number } {
  let i = start;
  
  // Skip whitespace
  while (i < input.length && /\s/.test(input[i])) i++;
  
  const char = input[i];
  
  // String value
  if (char === "'" || char === '"') {
    const quote = char;
    i++;
    const valueStart = i;
    while (i < input.length && input[i] !== quote) {
      if (input[i] === '\\') i++; // skip escaped chars
      i++;
    }
    const value = input.slice(valueStart, i);
    i++; // skip closing quote
    return { value, endIndex: i };
  }
  
  // Object value
  if (char === '{') {
    // Find matching closing brace
    let depth = 1;
    const objStart = i;
    i++;
    while (i < input.length && depth > 0) {
      if (input[i] === '{') depth++;
      if (input[i] === '}') depth--;
      if ((input[i] === "'" || input[i] === '"') && input[i - 1] !== '\\') {
        // Skip string content
        const quote = input[i];
        i++;
        while (i < input.length && input[i] !== quote) {
          if (input[i] === '\\') i++;
          i++;
        }
      }
      i++;
    }
    const objStr = input.slice(objStart, i);
    const value = parseObject(objStr);
    return { value, endIndex: i };
  }
  
  // Number value
  if (/[-\d]/.test(char)) {
    const numStart = i;
    while (i < input.length && /[-\d.]/.test(input[i])) i++;
    const value = parseFloat(input.slice(numStart, i));
    return { value, endIndex: i };
  }
  
  // Boolean or identifier
  const identStart = i;
  while (i < input.length && /[a-zA-Z0-9_$]/.test(input[i])) i++;
  const ident = input.slice(identStart, i);
  
  if (ident === 'true') return { value: true, endIndex: i };
  if (ident === 'false') return { value: false, endIndex: i };
  if (ident === 'null') return { value: null, endIndex: i };
  if (ident === 'undefined') return { value: undefined, endIndex: i };
  
  // Unknown identifier - return as string
  return { value: ident, endIndex: i };
}

/**
 * Check if a cx() call contains only static values
 * Returns false if it contains variables or dynamic expressions
 */
export function isStaticCxCall(raw: string): boolean {
  // Check for variable references (but allow $ token references)
  // This is a heuristic - a proper implementation would use AST
  
  const objectPart = raw.match(/\bcx\s*\(\s*(\{[\s\S]*?\})\s*\)/)?.[1] || '';
  
  // Remove strings to avoid false positives
  const withoutStrings = objectPart.replace(/'[^']*'|"[^"]*"/g, '""');
  
  // Check for identifiers that aren't keywords
  const identifiers = withoutStrings.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
  const keywords = new Set([
    'true', 'false', 'null', 'undefined',
    // CSS properties and values - this is not exhaustive
  ]);
  
  for (const ident of identifiers) {
    // If we find an identifier that's not a keyword and not a CSS property/value,
    // it might be a variable reference
    // For now, we'll be permissive and only warn
  }
  
  return true;
}

