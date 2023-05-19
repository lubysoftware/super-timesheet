import { TimesheetStoreTypes } from '@/store/timesheet/types';

import { create } from 'zustand';

const useTimesheetStore = create<TimesheetStoreTypes>(() => ({
  loading: false,
  clients: [],
}));

export default useTimesheetStore;
