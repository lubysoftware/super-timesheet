import { Timesheet } from '@/services/timesheet/types';

export interface TimesheetStoreTypes {
  loading: boolean;
  clients: Timesheet.Client[];
}
