import ts from 'typescript';
import type { StyleTree } from './css.ts';

export const MODULE_NAME = 'puttycss';
export const EXPORT_NAME = 'cx';

export interface Span {
  start: number;
  end: number;
}

export interface ExtractedCall extends Span {
  styles: StyleTree;
}

export interface CxImport extends Span {
  /** Local name `cx` was bound to (`cx`, or `css` for `import { cx as css }`). */
  localName: string;
  /** Span of the `cx` specifier inside the braces, for partial removal. */
  specifier: Span;
  /** Whether other specifiers (default import or named, including type-only) share this declaration. */
  hasOtherSpecifiers: boolean;
  /** Regenerated import text with `cx` removed, when other specifiers remain. */
  withoutCx: string;
}

export interface ExtractResult {
  import: CxImport | null;
  calls: ExtractedCall[];
}

/**
 * Error with a precise source location, suitable for bundler error overlays.
 */
export class ExtractError extends Error {
  readonly file: string;
  /** Character offset in the source. */
  readonly pos: number;
  /** 1-based. */
  readonly line: number;
  /** 1-based. */
  readonly column: number;

  constructor(message: string, file: string, pos: number, line: number, column: number) {
    super(`${file}:${line}:${column}: ${message}`);
    this.name = 'ExtractError';
    this.file = file;
    this.pos = pos;
    this.line = line;
    this.column = column;
  }
}

/** Cheap pre-check so callers can skip parsing files that can't contain cx() calls. */
export function mayContainCx(code: string): boolean {
  return code.includes(MODULE_NAME);
}

/**
 * Find every `cx({...})` call in a source file and statically evaluate its argument.
 * `cx` must be imported from `puttycss` (aliases are fine). Anything that is not a
 * literal string, number or nested object literal is an error.
 */
export function extract(code: string, fileName: string): ExtractResult {
  const sf = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, scriptKind(fileName));

  const cxImport = findImport(sf, code);
  if (!cxImport) return { import: null, calls: [] };

  const calls: ExtractedCall[] = [];
  const fail = (node: ts.Node, message: string): never => {
    const pos = node.getStart(sf);
    const { line, character } = sf.getLineAndCharacterOfPosition(pos);
    throw new ExtractError(message, fileName, pos, line + 1, character + 1);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === cxImport.localName && isReference(node)) {
      const call = node.parent;
      if (!ts.isCallExpression(call) || call.expression !== node) {
        return fail(
          node,
          `${cxImport.localName}() must be called directly; it cannot be passed around or aliased ` +
            `because it is compiled away at build time.`,
        );
      }
      if (call.arguments.length !== 1) {
        return fail(call, `${cxImport.localName}() takes exactly one argument, an object literal.`);
      }
      const arg = unwrap(call.arguments[0]);
      if (!ts.isObjectLiteralExpression(arg)) {
        return fail(
          arg,
          `${cxImport.localName}() must be given an object literal. Variables and expressions cannot ` +
            `be compiled statically. Found ${ts.SyntaxKind[arg.kind]}.`,
        );
      }
      calls.push({
        start: call.getStart(sf),
        end: call.getEnd(),
        styles: evaluateObject(arg, sf, fail),
      });
      return; // don't descend into the argument again
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);

  return { import: cxImport, calls };
}

// ---------------------------------------------------------------------------

function scriptKind(fileName: string): ts.ScriptKind {
  const clean = fileName.split('?')[0];
  if (/\.tsx$/.test(clean)) return ts.ScriptKind.TSX;
  if (/\.[cm]?ts$/.test(clean)) return ts.ScriptKind.TS;
  if (/\.[cm]?jsx?$/.test(clean)) return ts.ScriptKind.JSX; // JSX parses plain JS too
  return ts.ScriptKind.TSX;
}

/**
 * True when an identifier is a value reference, as opposed to a property name
 * (`foo.cx`, `{ cx: 1 }`, `<div cx="" />`), a declaration name, or an import binding.
 */
function isReference(node: ts.Identifier): boolean {
  const p = node.parent;
  if (ts.isImportSpecifier(p) || ts.isImportClause(p)) return false;
  if (ts.isPropertyAccessExpression(p) && p.name === node) return false;
  if (ts.isPropertyAssignment(p) && p.name === node) return false;
  if (ts.isJsxAttribute(p)) return false;
  if (ts.isTypeReferenceNode(p) || ts.isTypeQueryNode(p)) return false;
  if (
    (ts.isVariableDeclaration(p) || ts.isParameter(p) || ts.isFunctionDeclaration(p) ||
      ts.isBindingElement(p) || ts.isClassDeclaration(p) || ts.isMethodDeclaration(p) ||
      ts.isPropertyDeclaration(p)) &&
    p.name === node
  ) {
    return false;
  }
  return true;
}

/** Strip parentheses, `as`, `satisfies` and non-null wrappers. */
function unwrap(node: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isNonNullExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    node = node.expression;
  }
  return node;
}

function findImport(sf: ts.SourceFile, code: string): CxImport | null {
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt)) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier) || stmt.moduleSpecifier.text !== MODULE_NAME) continue;
    const clause = stmt.importClause;
    if (!clause || clause.isTypeOnly || !clause.namedBindings || !ts.isNamedImports(clause.namedBindings)) {
      continue;
    }
    const elements = clause.namedBindings.elements;
    const cxSpec = elements.find(
      (el) => !el.isTypeOnly && (el.propertyName ?? el.name).text === EXPORT_NAME,
    );
    if (!cxSpec) continue;

    const remaining = elements.filter((el) => el !== cxSpec);
    const hasOtherSpecifiers = remaining.length > 0 || !!clause.name;

    let withoutCx = '';
    if (hasOtherSpecifiers) {
      const parts: string[] = [];
      if (clause.name) parts.push(clause.name.text);
      if (remaining.length > 0) {
        parts.push(`{ ${remaining.map((el) => code.slice(el.getStart(sf), el.getEnd())).join(', ')} }`);
      }
      withoutCx = `import ${parts.join(', ')} from ${code.slice(
        stmt.moduleSpecifier.getStart(sf),
        stmt.moduleSpecifier.getEnd(),
      )};`;
    }

    return {
      start: stmt.getStart(sf),
      end: stmt.getEnd(),
      localName: cxSpec.name.text,
      specifier: { start: cxSpec.getStart(sf), end: cxSpec.getEnd() },
      hasOtherSpecifiers,
      withoutCx,
    };
  }
  return null;
}

type Fail = (node: ts.Node, message: string) => never;

function evaluateObject(obj: ts.ObjectLiteralExpression, sf: ts.SourceFile, fail: Fail): StyleTree {
  const out: StyleTree = {};

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) {
      const what = ts.isSpreadAssignment(prop)
        ? 'Spread'
        : ts.isShorthandPropertyAssignment(prop)
          ? 'Shorthand property'
          : 'Method';
      fail(prop, `${what} is not allowed inside cx(); every property must be a literal "key: value".`);
    }

    const key = propertyKey(prop.name, fail);
    const init = unwrap(prop.initializer);
    const isNested = key.startsWith('&') || key.startsWith('@');

    if (ts.isObjectLiteralExpression(init)) {
      if (!isNested) {
        fail(
          prop.name,
          `Property "${key}" has an object value. Nested objects are only allowed under selector ` +
            `keys ("&:hover") or at-rule keys ("@media ...").`,
        );
      }
      out[key] = evaluateObject(init, sf, fail);
      continue;
    }

    if (isNested) {
      fail(init, `"${key}" must map to a style object.`);
    }

    out[key] = literalValue(init, fail);
  }

  return out;
}

function propertyKey(name: ts.PropertyName, fail: Fail): string {
  if (ts.isIdentifier(name)) return name.text;
  if (ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name)) {
    const expr = unwrap(name.expression);
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return expr.text;
    return fail(
      name,
      `Computed keys must be string literals. Variables cannot be compiled statically.`,
    );
  }
  return fail(name, `Unsupported property key (${ts.SyntaxKind[name.kind]}).`);
}

function literalValue(node: ts.Expression, fail: Fail): string | number {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (
    ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand)
  ) {
    return -Number(node.operand.text);
  }
  if (ts.isTemplateExpression(node)) {
    return fail(node, `Template literals with expressions cannot be compiled statically.`);
  }
  if (ts.isIdentifier(node)) {
    return fail(
      node,
      `"${node.text}" is a variable. Values must be literal strings or numbers so they can be ` +
        `compiled away; use a CSS custom property for runtime values.`,
    );
  }
  if (ts.isConditionalExpression(node)) {
    return fail(node, `Conditional values cannot be compiled statically. Use two cx() calls instead.`);
  }
  return fail(node, `Values must be literal strings or numbers. Found ${ts.SyntaxKind[node.kind]}.`);
}
