import type { PaletteOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    // Add any custom palette colors here if needed
  }
  interface PaletteOptions {
    // Add any custom palette options here if needed
  }
}

export const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1e5c3a', // Dark forest green — buttons, highlights
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#c49a1a', // Golden amber — accents, warnings
    contrastText: '#ffffff',
  },
  success: {
    main: '#1e5c3a',
  },
  warning: {
    main: '#c49a1a',
  },
  error: {
    main: '#EF4444',
  },
  info: {
    main: '#38BDF8', // Sky Blue — informational, non-urgent
  },
  background: {
    default: '#f5f4f0', // Milky off-white — app background
    paper: '#fafaf8',   // Warm white — cards/surfaces
  },
  text: {
    primary: '#1a2340',   // Deep navy — headings + body
    secondary: '#6b7280', // Medium gray — labels, placeholders
  },
};
