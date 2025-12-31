import type { ThemeConfig } from './types';

/**
 * Define a theme configuration
 */
export function defineTheme<T extends ThemeConfig>(config: T): T {
  return config;
}
