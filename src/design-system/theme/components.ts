import { Components, Theme } from '@mui/material/styles';

export const components: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      @font-face {
        font-family: 'Outfit';
        font-display: swap;
      }
      html, body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `,
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.surface.glass,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
        boxShadow: theme.shadows[1],
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.surface.glass,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
      }),
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        minHeight: '44px', // shop-floor touch target
        padding: '10px 20px',
      },
      containedPrimary: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        '&:hover': {
          backgroundColor: '#2D278A', // Slightly darker indigo
        },
      }),
      outlined: ({ theme }) => ({
        borderColor: theme.palette.secondary.main,
        color: theme.palette.text.primary,
        '&:hover': {
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.surface.highlight,
        },
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.75rem',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-hover:hover': {
          backgroundColor: theme.palette.surface.highlight,
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.surface.highlight,
          borderLeft: `3px solid ${theme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: theme.palette.surface.highlight,
          },
        },
      }),
    },
  },
  MuiSkeleton: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderRadius: '4px',
      },
    },
    defaultProps: {
      animation: 'wave',
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#1E293B',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '8px',
        fontSize: '0.75rem',
        padding: '8px 12px',
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.surface.overlay,
        backdropFilter: 'blur(16px)',
        backgroundImage: 'none',
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.surface.overlay,
        backdropFilter: 'blur(16px)',
        backgroundImage: 'none',
      }),
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        minHeight: '44px', // shop-floor touch target
        '&.Mui-focused': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: '2px',
          },
        },
      }),
    },
  },
};
