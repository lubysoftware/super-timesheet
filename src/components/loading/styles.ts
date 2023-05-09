import { alpha } from '@mui/system';

import styled from '@emotion/styled';

const Container = styled.main`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  background-color: ${({ theme }): string =>
    alpha(theme.palette.background.default, 0.4)};
  backdrop-filter: blur(1rem);
  -webkit-backdrop-filter: blur(1rem);

  #clock {
    border-radius: 50%;
    border: 2px solid ${({ theme }): string => theme.palette.text.primary};
    width: 6rem;
    height: 6rem;
    display: flex;
    align-items: center;
    justify-content: center;

    #hour-hand,
    #minute-hand {
      width: 0.2rem;
      background-color: transparent;
      border-top: 1rem solid
        ${({ theme }): string => theme.palette.text.primary};
      box-sizing: border-box;
      position: absolute;
    }

    #hour-hand {
      height: 3.4rem;
      border-top-width: 2rem;
      animation: hours linear 12s infinite;
    }

    #minute-hand {
      height: 5.4rem;
      border-top-width: 3rem;
      animation: minutes linear 2s infinite;
    }
  }

  #text {
    margin-top: 1rem;
    height: 2rem;
  }

  @keyframes hours {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes minutes {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingStyle = { Container };

export default LoadingStyle;
