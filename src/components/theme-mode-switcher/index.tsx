import { FC } from 'react';

import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import useUiStore from '@/store/ui/store';

const ThemeModeSwitcher: FC = () => {
  const { themeMode, switchThemeMode } = useUiStore();

  return (
    <Tooltip
      title={`Alternar para o modo  ${
        themeMode === 'dark' ? 'claro' : 'escuro'
      }`}
      arrow
      placement="right"
    >
      <IconButton size="large" color="inherit" onClick={switchThemeMode}>
        {themeMode === 'dark' ? (
          <LightModeIcon color="disabled" />
        ) : (
          <DarkModeIcon color="disabled" />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeModeSwitcher;
