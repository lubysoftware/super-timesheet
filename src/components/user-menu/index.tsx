import { FC, MouseEvent, useState } from 'react';

import { Logout } from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';

import { supabase } from '@/config/supabase';
import useUserStore from '@/store/user/store';

const UserMenu: FC = () => {
  const { user } = useUserStore();

  const [menu, setMenu] = useState<null | HTMLElement>();

  if (!user) return <></>;

  const handleOpen = (event: MouseEvent<HTMLElement>): void =>
    setMenu(event.currentTarget);

  const handleClose = (): void => setMenu(null);

  const handleSignOut = async (): Promise<void> =>
    void (await supabase.auth.signOut());

  return (
    <>
      <Tooltip title={`Logado como ${user.name}`} arrow placement="right">
        <IconButton
          size="large"
          onClick={handleOpen}
          color="inherit"
          aria-label="Imagem do usuário"
        >
          <Avatar alt={user.name} src={user.avatar} />
        </IconButton>
      </Tooltip>
      <Menu
        id="menu-appbar"
        anchorEl={menu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(menu)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={handleSignOut}
          style={{ gap: 8, alignItems: 'center' }}
        >
          <Typography textAlign="center">Sair</Typography>
          <Logout fontSize="small" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
