import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import React from 'react';
import { palette } from './palette';
import { typography } from './typography';
import { shadows } from './shadows';
import { components } from './components';
import { cssTokens } from '../tokens/colors';

export const workshopTheme = createTheme({
  palette,
  typography,
  shadows,
  components,
  shape: {
    borderRadius: 8,
  },
});

interface ThemeRegistryProps {
  children: React.ReactNode;
}

export function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <ThemeProvider theme={workshopTheme}>
      <CssBaseline />
      <GlobalStyles styles={cssTokens} />
      {children}
    </ThemeProvider>
  );
}
