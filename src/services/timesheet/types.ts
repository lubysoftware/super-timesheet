import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';

export namespace Timesheet {
  export interface Service {
    encryptPassword(text: string): Promise<Timesheet.CryptoHash>;
    verifyLoginIsValid(input: TimesheetInfos.Input): Promise<boolean>;
  }

  export interface CryptoHash {
    iv: string;
    content: string;
  }
}
