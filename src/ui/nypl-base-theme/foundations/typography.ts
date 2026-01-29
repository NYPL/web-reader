import { Dict } from '../types';

type Typography = {
  letterSpacings: Dict;
  lineHeights: Dict;
  fontWeights: Dict;
  fonts: Dict;
  fontSizes: Dict;
};

const typography: Typography = {
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    mono: `Courier,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace`,
  },
  fontSizes: {
    '-2': '0.75rem',
    '-1': '0.875rem',
    '0': '1rem',
    '1': '1.125rem',
    '2': '1.25rem',
    '3': '1.75rem',
    '4': '2.25rem',
    '5': '3rem',
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700,
  },
  lineHeights: [1, 1.1, 1.25, 1.5, 2, 2.5],
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};
export default typography;
