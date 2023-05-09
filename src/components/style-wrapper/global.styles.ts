import { darken } from '@mui/system';

import styled from '@emotion/styled';

const GlobalStyles = styled.div`
  * {
    &::selection {
      background-color: ${({ theme }): string => theme.palette.primary.dark};
      color: ${({ theme }): string => theme.palette.primary.contrastText};
    }

    &::-webkit-scrollbar {
      height: 4px;
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background-color: ${({ theme }): string =>
        darken(theme.palette.background.default, 0.2)};
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }): string =>
        darken(theme.palette.primary.dark, 0.4)};
      border-radius: 0.6rem;
    }
  }

  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;

  align-items: stretch;
  justify-content: stretch;

  background-color: ${({ theme }): string => theme.palette.background.default};
  color: ${({ theme }): string => theme.palette.text.primary};
`;

export default GlobalStyles;
