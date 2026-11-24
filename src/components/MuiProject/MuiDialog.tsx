import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  DialogActions,
} from '@mui/material';
import { ConfirmDialogPaper } from './ConfirmDialogPaper';
import { ButtonStyled } from './ButtonStyled';
import { useTranslation } from 'react-i18next';

type MuiDialogProps = {
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
};

export const MuiDialog = ({ confirmOpen, setConfirmOpen }: MuiDialogProps) => {
  const { t } = useTranslation('muiForm');
  return (
    <Dialog
      open={confirmOpen}
      // Use custom paper component for the dialog to apply custom styles and elevation.
      // it will replace the default paper component with the custom one.
      slots={{ paper: ConfirmDialogPaper }}
      // Apply elevation to the custom paper component to give it a shadow effect
      slotProps={{ paper: { elevation: 3 } }}
    >
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>{t('confirmDialogMessage')}</Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <ButtonStyled onClick={() => setConfirmOpen(false)}>
          {t('cancel')}
        </ButtonStyled>
        <ButtonStyled onClick={() => setConfirmOpen(false)} variant="contained">
          {t('confirm')}
        </ButtonStyled>
      </DialogActions>
    </Dialog>
  );
};
