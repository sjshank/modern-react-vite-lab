import {
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Button,
  Typography,
  ScopedCssBaseline,
  Box,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { type AppTheme, createAppTheme } from '../../styles/mui-theme/theme';
import { useRef, useState } from 'react';
import { FormSurface } from './FormSurface';
import { ButtonStyled } from './ButtonStyled';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { MuiDialog } from './MuiDialog';

export const MuiForm = () => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('light');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const theme = createAppTheme(currentTheme);
  const { t } = useTranslation('muiForm');
  const lang = i18n.resolvedLanguage ?? i18n.language;
  const isFrench = lang === 'fr';
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (
    e: React.SubmitEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    // Handle form submission logic here, e.g., validate input, send data to server, etc.
    const email = emailRef.current?.value;
    if (!email) {
      // Handle empty email case
      alert(t('emptyEmailAlert'));
      return;
    }
    setConfirmOpen(true);
  };
  return (
    <ThemeProvider theme={theme}>
      {/* why cssbaseline ? - CssBaseline is used to kickstart an elegant, consistent, and simple baseline to build upon. It normalizes styles across browsers and applies a consistent baseline for typography, spacing, and other elements.
      Does it apply the baseline styles to the entire application or just this component ? 
      It applies the baseline styles globally to the entire application.
      Does it place reset styles for elements like body, h1-h6, p, etc.?
      Yes, CssBaseline applies reset styles to these elements to ensure consistency across browsers.
       */}
      {/* <CssBaseline /> */}
      {/* ScopedCssBaseline applies the baseline styles only to this component and its children, not globally. */}
      <ScopedCssBaseline />
      <FormSurface
        variant="elevation"
        elevation={4}
        square
        className="flex-column gap-4 p-4"
      >
        <Typography variant="h4">{t('title')}</Typography>
        <Button
          onClick={() =>
            setCurrentTheme((current) =>
              current === 'light' ? 'dark' : 'light',
            )
          }
        >
          {`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
        </Button>
        <Button
          onClick={() => void i18n.changeLanguage(isFrench ? 'en' : 'fr')}
        >
          {t(isFrench ? 'switchToEnglish' : 'switchToFrench')}
        </Button>
        <form
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          className="flex-column gap-4 justify-center items-center w-full relative"
        >
          <FormControl>
            <InputLabel htmlFor="my-input">{t('emailLabel')}</InputLabel>
            <Input
              id="my-input"
              aria-describedby="my-helper-text"
              inputRef={emailRef}
            />
            <FormHelperText id="my-helper-text">
              {t('emailHelp')}
            </FormHelperText>
          </FormControl>

          <ButtonStyled type="submit" variant="contained">
            {t('submit')}
          </ButtonStyled>
        </form>
        <Box className="flex-column gap-1 p-1">
          <Typography>
            Typescript agumentation example : Custom status colors (danger and
            warning) added in the MUI theme.
          </Typography>
          <Typography>
            <span style={{ color: theme.status.danger }}>Danger color</span>:{' '}
            {theme.status.danger},{' '}
            <span style={{ color: theme.status.warning }}>Warning color</span>:{' '}
            {theme.status.warning}
          </Typography>
        </Box>
        <MuiDialog confirmOpen={confirmOpen} setConfirmOpen={setConfirmOpen} />
      </FormSurface>
    </ThemeProvider>
  );
};
