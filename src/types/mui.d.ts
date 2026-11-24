import '@mui/material/styles';

// Extend the MUI theme to include custom (types) status colors (danger and warning)
declare module '@mui/material/styles' {
  // Add custom status colors to the theme
  interface Theme {
    // add status.warning, declare the extra fields:
    status: {
      danger: string;
      warning: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
      warning?: string;
    };
  }
}
