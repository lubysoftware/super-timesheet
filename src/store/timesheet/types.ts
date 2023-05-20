import { GithubCommit } from '@/services/github/github-commit/types';
import { Timesheet } from '@/services/timesheet/types';

export interface TimesheetStoreTypes {
  loading: boolean;
  clients: Timesheet.Client[];
  dayTimes: GithubCommit.DayTime[];
  setDayTimes(dayTimes: GithubCommit.DayTime[]): void;
}
