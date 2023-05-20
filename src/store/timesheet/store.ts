import { TimesheetStoreTypes } from '@/store/timesheet/types';

import { create } from 'zustand';

const useTimesheetStore = create<TimesheetStoreTypes>((set) => ({
  loading: false,
  clients: [],
  dayTimes: [],

  setDayTimes(dayTimes): void {
    set({ dayTimes });
  },
}));

export default useTimesheetStore;
