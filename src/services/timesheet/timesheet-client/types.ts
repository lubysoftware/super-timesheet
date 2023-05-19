import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';
import { Timesheet } from '@/services/timesheet/types';

import { AxiosRequestConfig } from 'axios';
import { Cookie } from 'tough-cookie';

export namespace TimesheetClient {
  export interface Input {
    iv: TimesheetInfos.Row['iv'];
    content: TimesheetInfos.Row['content'];
    login: TimesheetInfos.Row['login'];
  }

  export interface Service {
    configRequest(cookies: Cookie[]): AxiosRequestConfig;
    loadCategories(
      projectId: Timesheet.Project['id'],
      cookies: Cookie[]
    ): Promise<Timesheet.Category[]>;
    loadProjects(
      clientId: Timesheet.Client['id'],
      cookies: Cookie[]
    ): Promise<Timesheet.Project[]>;
    loadClients(cookies: Cookie[]): Promise<Timesheet.Client[]>;
    getAll(): Promise<Timesheet.Client[]>;
  }
}
