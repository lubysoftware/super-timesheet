import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';

import { Cookie } from 'tough-cookie';

export namespace Timesheet {
  export interface Service {
    routes: {
      home: string;
      accountLogin: string;
      homeIndex: string;
      worksheetRead: string;
      controlPanelManagerDeveloper: string;
    };
    encryptPassword(text: string): Promise<Timesheet.CryptoHash>;
    verifyLoginIsValid(input: TimesheetInfos.Input): Promise<boolean>;
    loadCookies(login: string, password: string): Promise<Cookie[]>;
  }

  export interface CryptoHash {
    iv: string;
    content: string;
  }
}
