import { appointmentSchema } from '@/services/timesheet/timesheet-appointment/schema';
import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';

import { AxiosRequestConfig } from 'axios';
import { InferType } from 'prop-types';
import { Cookie } from 'tough-cookie';

export namespace TimesheetAppointment {
  export interface Input {
    appointments: Row[];
  }

  export interface ApiInput {
    iv: TimesheetInfos.Row['iv'];
    content: TimesheetInfos.Row['content'];
    login: TimesheetInfos.Row['login'];
    appointments: Row[];
  }

  export interface Output extends Row {
    success: boolean;
    errorMessage?: string;
  }

  export interface Row {
    client: string;
    project: string;
    category: string;
    date: string;
    startTime: string;
    endTime: string;
    notMonetize?: boolean;
    commitLink?: string;
    description: string;
  }

  export interface Service {
    entity: 'TimesheetAppointment';
    configRequest(cookies: Cookie[]): AxiosRequestConfig;
    makeBody(WebKitFormBoundary: string, data: TimesheetAppointment): string;
    appointmentParse(
      data: Row
    ): Omit<TimesheetAppointment, '__RequestVerificationToken'>;
    send(input: Input): Promise<Output[]>;
    schema: InferType<typeof appointmentSchema>;
  }

  export interface Schema {
    appointments: {
      client?: { label: string; value: string };
      project?: { label: string; value: string };
      category?: { label: string; value: string };
      date: string;
      start: string;
      end: string;
      description: string;
    }[];
  }

  export interface TimesheetAppointment {
    __RequestVerificationToken: string;
    Id: string;
    IdCustomer: string;
    IdProject: string;
    IdCategory: string;
    // No formado dd/MM/yyyy
    InformedDate: string;
    // No formato hh:mm
    StartTime: string;
    // No formato hh:mm
    EndTime: string;
    NotMonetize: string;
    CommitRepository: string;
    Description: string;
  }
}
