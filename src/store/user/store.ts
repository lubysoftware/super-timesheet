import { User, UserStoreTypes } from '@/store/user/types';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create<UserStoreTypes>()(
  persist(
    (set) => ({
      setUser(data: User): void {
        set({ user: data });
      },

      wipeUser(): void {
        set({ user: undefined });
      },
    }),
    { name: 'super-timesheet:user-storage' }
  )
);

export default useUserStore;
