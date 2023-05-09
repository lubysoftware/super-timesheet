import { FC, PropsWithChildren } from 'react';

import { CssBaseline, ThemeProvider } from '@mui/material';

import GlobalStyles from '@/components/style-wrapper/global.styles';
import useUiStore from '@/store/ui/store';

const StyleWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { theme } = useUiStore();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles>{children}</GlobalStyles>
    </ThemeProvider>
  );
};

export default StyleWrapper;
