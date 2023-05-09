import { darkTheme, lightTheme } from '@/components/style-wrapper/global.theme';
import { Load, UiStoreTypes } from '@/store/ui/types';

import { create } from 'zustand';

const useUiStore = create<UiStoreTypes>((set, get) => ({
  theme: darkTheme,
  themeMode: 'dark',
  loading: [],

  switchThemeMode(): void {
    set((previous) =>
      previous.theme.palette.mode === 'light'
        ? { theme: darkTheme, themeMode: 'dark' }
        : { theme: lightTheme, themeMode: 'light' }
    );
  },

  enableLoad(load: Load): void {
    const { loading } = get();

    if (loading.includes(load)) return;

    set({ loading: loading.concat(load) });
  },

  disableLoad(load: Load): void {
    const { loading } = get();

    if (!loading.includes(load)) return;

    set({ loading: loading.filter((item) => item !== load) });
  },
}));

export default useUiStore;
