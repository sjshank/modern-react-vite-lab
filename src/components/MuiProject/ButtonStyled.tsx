import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ButtonStyled = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.primary.main,
  variants: [
    {
      props: { variant: 'contained' },
      style: {
        '&:hover': {
          backgroundColor: theme.palette.secondary.main,
          textTransform: 'uppercase',
          transform: 'scale(1.01)',
        },
      },
    },
  ],
}));
