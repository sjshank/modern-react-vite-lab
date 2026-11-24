import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

// Custom styled Paper component for the confirm dialog to apply specific styles.
// It will replace the default paper component in the dialog with this custom one.
export const ConfirmDialogPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[6],
}));
