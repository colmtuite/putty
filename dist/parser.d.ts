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
export declare function findCxCalls(source: string): CxCall[];
/**
 * Check if a cx() call contains only static values
 * Returns false if it contains variables or dynamic expressions
 */
export declare function isStaticCxCall(raw: string): boolean;
//# sourceMappingURL=parser.d.ts.map