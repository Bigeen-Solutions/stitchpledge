import type { TypographyOptions } from '@mui/material/styles';

/**
 * SPECIAL RULE:
 * Deadline values on order views must always render as variant="h5" or larger.
 * This ensures high visibility for critical time-sensitive information.
 */
export const typography: TypographyOptions = {
  fontFamily: "'Inter', 'Outfit', sans-serif",
  h1: {
    fontSize: '2.25rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.375rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6,
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.7,
  },
  body1: {
    fontSize: '0.9375rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.8125rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  overline: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    lineHeight: 1.5,
  },
};
