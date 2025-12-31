import { defineTheme, createCx } from '../src/index';

export const theme = defineTheme({
  tokens: {
    colors: {
      white: '#ffffff',
      black: '#000000',
      black50: 'rgba(0, 0, 0, 0.5)',
      transparent: 'transparent',
      current: 'currentColor',
      
      // Grays
      gray1: '#fcfcfc',
      gray2: '#f8f8f8',
      gray3: '#f3f3f3',
      gray4: '#ededed',
      gray5: '#e8e8e8',
      gray6: '#e2e2e2',
      gray7: '#dbdbdb',
      gray8: '#c7c7c7',
      gray9: '#8f8f8f',
      gray10: '#858585',
      gray11: '#6f6f6f',
      gray12: '#171717',

      // Primary (blue)
      primary1: '#fbfdff',
      primary2: '#f5faff',
      primary3: '#edf6ff',
      primary4: '#e1f0ff',
      primary5: '#cee7fe',
      primary6: '#b7d9f8',
      primary7: '#96c7f2',
      primary8: '#5eb0ef',
      primary9: '#0091ff',
      primary10: '#0081f1',
      primary11: '#006adc',
      primary12: '#00254d',

      // Success (green)
      success9: '#30a46c',
      
      // Error (red)  
      error9: '#e5484d',
    },
    spacing: {
      'px': '1px',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '32px',
      '9': '40px',
      '10': '48px',
      '11': '64px',
    },
    sizes: {
      '0': '0',
      full: '100%',
      screen: '100vw',
      screenH: '100vh',
      min: 'min-content',
      max: 'max-content',
      fit: 'fit-content',
    },
    fonts: {
      sans: 'test die grotesk a, ui-sans-serif, system-ui, sans-serif',
      mono: 'ui-monospace, monospace',
    },
    fontSizes: {
      '1': '12px',
      '2': '14px',
      '3': '16px',
      '4': '18px',
      '5': '20px',
      '6': '24px',
      '7': '28px',
      '8': '35px',
      '9': '60px',
    },
    fontWeights: {
      '1': '400',
      '2': '600',
    },
    lineHeights: {
      '1': '1',
      '2': '1.25',
      '3': '1.5',
      '4': '1.75',
      '5': '2',
    },
    letterSpacings: {
      '1': '-0.05em',
      '2': '-0.025em',
      '3': '0',
      '4': '0.025em',
      '5': '0.05em',
      '6': '0.1em',
    },
    radii: {
      '1': '0',
      '2': '4px',
      '3': '6px',
      '4': '8px',
      '5': '12px',
      '6': '16px',
      full: '9999px',
    },
    shadows: {
      '1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      '2': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      '3': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      '4': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      '5': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    borders: {},
    zIndices: {},
    transitions: {
      '1': 'all 50ms ease',
      '2': 'all 100ms ease',
      '3': 'all 150ms ease',
    },
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
});

export type Theme = typeof theme;

export const cx = createCx<Theme>();
