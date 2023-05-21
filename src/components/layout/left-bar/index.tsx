import { FC } from 'react';

import { useRouter } from 'next/router';

import {
  Dashboard as DashboardIcon,
  GitHub as GithubIcon,
  Info as InfoIcon,
  MoreTime as AddIcon,
  Settings as SettingsIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import {
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  SvgIconTypeMap,
} from '@mui/material';
import { OverridableComponent } from '@mui/types';

import styled from '@emotion/styled';

import Bar from '@/components/layout/bar';
import useUiStore from '@/store/ui/store';
import { Load } from '@/store/ui/types';
import useUserStore from '@/store/user/store';
import { Routes } from '@/utils/routes';

import { transparentize } from 'polished';

namespace Bar {
  export interface Item {
    route?: Routes;
    name: string;
    Icon: OverridableComponent<SvgIconTypeMap>;
  }

  export interface Group {
    name: string;
    items: Item[];
  }
}

const Container = styled(Grid)`
  background-color: ${({ theme }): string =>
    theme.palette.mode === 'light'
      ? '#f1f2f7'
      : transparentize(0.98, '#f1f2f7')};

  .MuiList-root {
    padding: 1rem;

    .MuiListSubheader-root {
      background-color: transparent;
      text-transform: uppercase;
      font-size: 11px;
    }

    .MuiListItemButton-root {
      border-radius: 0.4rem;
      color: ${({ theme }): string => theme.palette.text.secondary};

      &.Mui-selected {
        color: ${({ theme }): string => theme.palette.primary.main};

        svg {
          fill: ${({ theme }): string => theme.palette.primary.main};
        }
      }

      .MuiListItemIcon-root {
        min-width: auto;
        margin-right: 0.8rem;
      }
    }
  }
`;

const redirectLoad = (goTo: Routes): Load => {
  switch (goTo) {
    case Routes.Login:
      return Load.RedirectToLogin;
    case Routes.SignUp:
      return Load.RedirectToSignUp;
    case Routes.Configurations:
      return Load.RedirectToConfigurations;
    case Routes.TimesheetAppointmentCreateWithGithub:
      return Load.RedirectToGithubCommitsLoad;
    case Routes.TimesheetAppointmentCreate:
      return Load.RedirectToTimesheetAppointmentCreate;
    case Routes.SystemOperation:
      return Load.RedirectToSystemOperation;
  }
};

const items: Bar.Group[] = [
  {
    name: 'Apontamentos',
    items: [
      { Icon: DashboardIcon, name: 'Dashboard' },
      {
        Icon: AddIcon,
        name: 'Incluir',
        route: Routes.TimesheetAppointmentCreate,
      },
      {
        Icon: GithubIcon,
        name: 'Incluir com Github',
        route: Routes.TimesheetAppointmentCreateWithGithub,
      },
      { Icon: ViewListIcon, name: 'Visualizar' },
    ],
  },
  {
    name: 'Sistema',
    items: [
      {
        Icon: InfoIcon,
        name: 'Funcionamento',
        route: Routes.SystemOperation,
      },
      {
        Icon: SettingsIcon,
        name: 'Configurações',
        route: Routes.Configurations,
      },
    ],
  },
];

const Item: FC<Bar.Item> = ({ name, Icon, route }) => {
  const router = useRouter();
  const { enableLoad } = useUiStore();

  const navigate = (): void => {
    if (!route || router.route === route) return;

    enableLoad(redirectLoad(route));
    void router.push(route);
  };

  return (
    <ListItemButton
      selected={route && router.pathname === route}
      disabled={!route}
      onClick={navigate}
    >
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={name} />
    </ListItemButton>
  );
};

const LeftBar: FC = () => {
  const { user } = useUserStore();

  if (!user) {
    return <Container />;
  }

  return (
    <Container item xs={3}>
      {items.map(({ name, items }) => (
        <List key={name} subheader={<ListSubheader>{name}</ListSubheader>}>
          {items.map((item) => (
            <Item key={item.name} {...item} />
          ))}
        </List>
      ))}
    </Container>
  );
};

export default LeftBar;
