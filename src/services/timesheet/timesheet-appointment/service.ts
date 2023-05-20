import { toast } from 'react-toastify';

import { timesheet } from '@/services/timesheet/service';
import { appointmentSchema } from '@/services/timesheet/timesheet-appointment/schema';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { timesheetInfos } from '@/services/timesheet/timesheet-infos/service';
import { routes } from '@/utils/routes';

import axios, { AxiosRequestConfig } from 'axios';
import { Cookie } from 'tough-cookie';

export const timesheetAppointment: TimesheetAppointment.Service = {
  entity: 'TimesheetAppointment',
  configRequest(cookies: Cookie[]): AxiosRequestConfig {
    const cookie: string = cookies.reduce(
      (previous, { key, value }) => `${previous} ${key}=${value};`,
      ''
    );

    return {
      baseURL: timesheet.routes.home,
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'x-requested-with': 'XMLHttpRequest',
        cookie,
        Referer: timesheet.routes.worksheetRead,
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    };
  },
  makeBody(
    WebKitFormBoundary: string,
    data: TimesheetAppointment.TimesheetAppointment
  ): string {
    const start = `------WebKitFormBoundary${WebKitFormBoundary}\r\nContent-Disposition: form-data; `;

    const values = Object.entries(data).reduce(
      (prev, [key, value]) =>
        prev + `${start}name="${key}"\r\n\r\n${value}\r\n`,
      ''
    );

    return `${values}------WebKitFormBoundary${WebKitFormBoundary}--\r\n`;
  },
  appointmentParse(
    data: TimesheetAppointment.Row
  ): Omit<
    TimesheetAppointment.TimesheetAppointment,
    '__RequestVerificationToken'
  > {
    return {
      Id: '0',
      IdCustomer: data.client,
      IdProject: data.project,
      IdCategory: data.category,
      InformedDate: data.date,
      StartTime: data.startTime,
      EndTime: data.endTime,
      NotMonetize: data.notMonetize ? 'true' : 'false',
      CommitRepository: data.commitLink || 'Não aplicado.',
      Description: data.description,
    };
  },
  async send({
    appointments,
  }: TimesheetAppointment.Input): Promise<TimesheetAppointment.Output[]> {
    try {
      if (appointments.length <= 0) {
        toast.error('Não há nada para apontar!');
      }

      const response = await timesheetInfos.get();

      if (!response || response.length === 0) return [];

      const input: TimesheetAppointment.ApiInput = {
        ...response[0],
        appointments,
      };

      const { data } = await axios.post<TimesheetAppointment.Output[]>(
        routes.api.timesheet.sendAppointments(),
        input
      );

      return data;
    } catch (e) {
      toast.error('Houve um problema ao enviar os apontamentos!');

      return [];
    }
  },
  schema: appointmentSchema,
};
