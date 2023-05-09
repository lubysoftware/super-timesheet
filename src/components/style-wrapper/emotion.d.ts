/* eslint-disable @typescript-eslint/no-empty-interface */
import '@emotion/react';
import { Theme as MUITheme } from '@mui/material/styles/createTheme';

declare module '@emotion/react' {
  export interface Theme extends MUITheme {}
}
