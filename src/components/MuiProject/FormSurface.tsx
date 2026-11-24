import { Paper } from '@mui/material';
// why styled ? - styled is used to create a custom styled component with MUI theme support. It allows you to define styles based on the theme and apply them to the component.
import { styled } from '@mui/material/styles';

// FormSurface is a custom styled Paper component that applies consistent spacing, layout, and theming based on the MUI theme. What type of pattern is this ?
// This is an example of the "styled component" pattern, where a base component (Paper) is extended with custom styles that are aware of the MUI theme.
//what does it do & return ?
// It applies consistent spacing, layout, and theming to the Paper component, returning a styled Paper component that can be used throughout the application with the defined styles.
export const FormSurface = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));
