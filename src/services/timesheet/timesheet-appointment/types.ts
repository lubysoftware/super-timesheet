import { appointmentSchema } from '@/services/timesheet/timesheet-appointment/schema';
import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';

import { AxiosRequestConfig } from 'axios';
import { InferType } from 'prop-types';
import { Cookie } from 'tough-cookie';

export namespace TimesheetAppointment {
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

  export enum Status {
    PreApproved = 'PreApproved',
    Approved = 'Approved',
    Review = 'Review',
    Unapproved = 'Unapproved',
    Draft = 'Draft',
    Unknown = 'Unknown',
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

  export interface Service {
    entity: 'TimesheetAppointment';
    configRequest(cookies: Cookie[]): AxiosRequestConfig;
    makeBody(WebKitFormBoundary: string, data: TimesheetAppointment): string;
    appointmentParse(
      data: Row
    ): Omit<TimesheetAppointment, '__RequestVerificationToken'>;
    send(input: Input): Promise<Output[]>;
    load(cookies: Cookie[]): Promise<Row[]>;
    search(): Promise<Row[]>;
    schema: InferType<typeof appointmentSchema>;
  }

  export interface Full {
    Worksheet: null;
    Require: null;
    Evaluate: null;
    TotalRows: number;
    PageSize: number;
    Table: null;
    Id: number;
    IdRequire: null;
    IdCustomer: number;
    CustomerName: null;
    IdProject: number;
    ProjectName: null;
    StartDate: null;
    EndDate: null;
    IdCell: number;
    CellName: null;
    IdCategory: number;
    IdManager: number;
    IdDeveloper: number;
    IsMaster: boolean;
    IdAncestor: number;
    DeveloperName: null;
    HourValue: null;
    ExtraValue: null;
    CategoryName: null;
    InformedDate: string;
    Created: null;
    StartTime: string;
    EndTime: string;
    TotalTime: null;
    NotMonetize: boolean;
    Description: string;
    CommitRepository: string | null;
    IsDeleted: boolean;
    TotalTimeInProject: null;
    ConsumedTimeInProject: null;
    IdEvaluate: null;
    IsApprove: null;
    IsReprove: null;
    IsReview: null;
    IsWait: null;
    IsPreApproved: null;
    TimePreApproved: null;
    UserPreApproved: null;
    IsPaid: boolean;
    ConsumedTimeInProjectExceded: boolean;
    TimeInWorksheetExceded: number;
    IsEvaluate: boolean;
    TypeReport: null;
    SumTotalTime: null;
    TotaltimeInMinutes: number;
    IdCustomerPreSelected: null;
    IdProjectPreSelected: null;
    IdDeveloperPreSelected: null;
    IsEvaluatePreSelected: boolean;
  }
}
