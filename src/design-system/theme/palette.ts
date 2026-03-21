import type { PaletteOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      glass: string;
      overlay: string;
      highlight: string;
    };
    risk: {
      onTrack: string;
      atRisk: string;
      overdue: string;
      unknown: string;
    };
  }
  interface PaletteOptions {
    surface?: {
      glass?: string;
      overlay?: string;
      highlight?: string;
    };
    risk?: {
      onTrack?: string;
      atRisk?: string;
      overdue?: string;
      unknown?: string;
    };
  }
}

export const palette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#3730A3', // Deep Indigo — authority, trust
  },
  secondary: {
    main: '#64748B', // Slate Gray — neutral, grounding
  },
  success: {
    main: '#4ADE80', // Sage Green — calm completion, ON_TRACK
  },
  warning: {
    main: '#F59E0B', // Warm Amber — AT_RISK (not alarming)
  },
  error: {
    main: '#EF4444', // Reserved ONLY for OVERDUE and hard failures
  },
  info: {
    main: '#38BDF8', // Sky Blue — informational, non-urgent
  },
  background: {
    default: '#0F172A', // Deep Navy — workshop darkness
    paper: '#1E293B',   // Card surface
  },
  text: {
    primary: '#F1F5F9', // Near-white for high contrast on dark
    secondary: '#94A3B8', // Muted slate for supporting text
  },
  surface: {
    glass: 'rgba(30, 41, 59, 0.7)',   // Glassmorphism card background
    overlay: 'rgba(15, 23, 42, 0.85)',  // Modal/drawer overlay
    highlight: 'rgba(55, 48, 163, 0.15)', // Subtle primary tint for active rows
  },
  risk: {
    onTrack: '#4ADE80',
    atRisk: '#F59E0B',
    overdue: '#EF4444',
    unknown: '#64748B',
  },
};
