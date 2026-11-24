// MUI theme configuration for the application theme and component overrides
// Why from '@mui/material/styles' is used: It provides the createTheme function to configure the MUI theme.
import type { Theme } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

// Type definition for the application theme (light or dark)
export type AppTheme = 'light' | 'dark';

// Function to create the MUI theme based on the application theme (light or dark) and apply component overrides
// how many times this function is called ? - This depends on how many times the theme needs to be created or updated in the application.
// Returns the created theme object which can be used with MUI ThemeProvider
export const createAppTheme = (appTheme: AppTheme): Theme => {
  // Create and return the MUI theme based on the application theme
  return createTheme({
    // Define the color palette, shape, and component overrides for the theme
    palette: {
      // Set the mode to either 'light' or 'dark' based on the application theme
      mode: appTheme,
      // Define the primary and secondary colors for the theme
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#0f766e',
      },
      divider: appTheme === 'light' ? 'red' : 'blue',
    },
    // define and use the token for custom status colors (danger and warning) mentioned in the extended theme types mui.d.ts
    status: {
      danger: '#f44336',
      warning: '#ff9800',
    },
    // Define the shape of components, such as border radius
    shape: {
      borderRadius: 6,
    },
    // Define component-specific overrides for the theme
    components: {
      // Override styles and default props for Button MUI component
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          variant: 'contained',
          size: 'small',
          color: 'primary',
          fullWidth: false,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      // Override styles and default props for Badge MUI component
      //   MuiBadge:{}
    },
  });
};
