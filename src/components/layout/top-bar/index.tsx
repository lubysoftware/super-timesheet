import { FC } from 'react';

import Link from 'next/link';

import { Grid } from '@mui/material';

import styled from '@emotion/styled';

import ThemeModeSwitcher from '@/components/theme-mode-switcher';
import UserMenu from '@/components/user-menu';
import useUserStore from '@/store/user/store';
import { routes } from '@/utils/routes';

import { transparentize } from 'polished';

const Container = styled(Grid)`
  z-index: 1299;
  box-shadow: 0 0 2px
    ${({ theme }): string =>
      theme.palette.mode === 'light'
        ? '#c8cbd9'
        : transparentize(0.8, '#c8cbd9')};

  #brand,
  #brand-inactive {
    display: flex;

    a {
      font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
      font-weight: 500;
      font-size: 1.25rem;
      line-height: 1.6;
      letter-spacing: 0.0075em;
      padding-left: 2rem;
      display: flex;
      align-items: center;
      flex: 1;
      color: ${({ theme }): string => theme.palette.text.secondary};
      text-decoration: none;
    }
  }

  #brand {
    background-color: ${({ theme }): string =>
      theme.palette.mode === 'light'
        ? '#f1f2f7'
        : transparentize(0.98, '#f1f2f7')};
  }
`;

const TopBar: FC = () => {
  const { user } = useUserStore();

  return (
    <Container container justifyContent="space-between">
      <Grid item xs={3} id={user ? 'brand' : 'brand-inactive'}>
        <Link href={user ? routes.configurations() : routes.login()}>
          Timesheet
        </Link>
      </Grid>
      <Grid item px={1}>
        <ThemeModeSwitcher />
        <UserMenu />
      </Grid>
    </Container>
  );
};

export default TopBar;
