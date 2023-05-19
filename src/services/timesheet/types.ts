import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';

import { Cookie } from 'tough-cookie';

export namespace Timesheet {
  export interface Category {
    id: number;
    name: string;
  }

  export interface Project {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    categories: Category[];
  }

  export interface Client {
    id: string;
    title: string;
    projects: Project[];
  }

  export interface Service {
    isLoading(): boolean;
    enableLoading(): void;
    disableLoading(): void;
    routes: {
      home: string;
      accountLogin: string;
      homeIndex: string;
      worksheetRead: string;
      controlPanelManagerDeveloper: string;
    };
    encryptPassword(text: string): Promise<Timesheet.CryptoHash>;
    decryptPassword(hash: Timesheet.CryptoHash): Promise<string>;
    verifyLoginIsValid(input: TimesheetInfos.Input): Promise<boolean>;
    loadCookies(login: string, password: string): Promise<Cookie[]>;
  }

  export interface CryptoHash {
    iv: string;
    content: string;
  }
}
