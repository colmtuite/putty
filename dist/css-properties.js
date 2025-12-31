/**
 * Convert camelCase to kebab-case
 */
export function toKebabCase(str) {
    return str.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}
//# sourceMappingURL=css-properties.js.map