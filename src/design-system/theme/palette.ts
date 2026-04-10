import type { PaletteOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    risk: {
      onTrack: string;
      atRisk: string;
      overdue: string;
      unknown: string;
    };
  }
  interface PaletteOptions {
    risk?: {
      onTrack?: string;
      atRisk?: string;
      overdue?: string;
      unknown?: string;
    };
  }
}

export const palette: PaletteOptions = {
  mode: 'light',
  risk: {
    onTrack: '#1e5c3a',
    atRisk: '#c49a1a',
    overdue: '#EF4444',
    unknown: '#6b7280',
  },
  primary: {
    main: '#1e5c3a',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#c49a1a',
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
    main: '#38BDF8',
  },
  background: {
    default: '#f5f4f0',
    paper: '#fafaf8',
  },
  text: {
    primary: '#1a2340',
    secondary: '#6b7280',
  },
};
