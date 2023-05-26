import { toast } from 'react-toastify';

import { timesheet } from '@/services/timesheet/service';
import { appointmentSchema } from '@/services/timesheet/timesheet-appointment/schema';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { timesheetInfos } from '@/services/timesheet/timesheet-infos/service';
import { routes } from '@/utils/routes';

import axios, { AxiosRequestConfig } from 'axios';
import { Cookie } from 'tough-cookie';

export const brDateToISO = (date: string): string => {
  const [day, month, year] = date.split('/');

  return `${year}-${month}-${day}T00:00:00.000Z`;
};

export const statusAdapter = (
  previous: string
): TimesheetAppointment.Status => {
  switch (previous) {
    case 'Aprovada':
      return TimesheetAppointment.Status.Approved;
    case 'Pré-Aprovada':
      return TimesheetAppointment.Status.PreApproved;
    case 'Em análise':
      return TimesheetAppointment.Status.Review;
    case 'Reprovada':
      return TimesheetAppointment.Status.Unapproved;
    default:
      return TimesheetAppointment.Status.Unknown;
  }
};

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
  async load(cookies: Cookie[]): Promise<TimesheetAppointment.Row[]> {
    let appointments: TimesheetAppointment.Row[] = [];

    try {
      const response = await axios.get(
        '/Worksheet/Read',
        this.configRequest(cookies)
      );

      const html: string = response.data;

      const regex = /(<tbody>)([\w\W]+?)(<\/tbody>)/gm;

      const search: string = (html.match(regex) || [''])[0];

      const cleanedSearch = search.split(/\r\n/gm).join('');

      const rows = cleanedSearch.match(/tr>([\S\s]+?)<\/tr/g);

      if (!rows) {
        if (html.match('<div class="login-content">'))
          console.error(`[${401}]: Cookies are invalid!`);
        else console.error(`[${500}]: Options not found!`);

        return [];
      }

      const appointmentsPromise = rows.map(
        async (row): Promise<TimesheetAppointment.Row> => {
          const cols = row.split(/<\/td>([\S\s]+?)<td>/gm);

          cols[0] = cols[0].replace(/tr>([\S\s]+?)<td>/gm, '');

          cols[16] = (cols[16].match(/fff">([\S\s]+?)<\/span/gm) || [''])[0];
          cols[16] = cols[16].replace(/fff">([\S\s]+?)<\/span/gm, '$1');

          cols[18] = (cols[18].match(/id="([\S\s]+?)"/gm) || [''])[0];
          cols[18] = cols[18].replace(/id="([\S\s]+?)"/gm, '$1');

          const partial = { code: cols[18], status: statusAdapter(cols[16]) };

          const {
            data: {
              IdProject,
              IdCategory,
              InformedDate,
              StartTime,
              EndTime,
              NotMonetize,
              Description,
            },
          } = await axios.get<TimesheetAppointment.Full>(
            `/Worksheet/Update?id=${partial.code}`,
            this.configRequest(cookies)
          );

          return {
            client: '?',
            project: String(IdProject),
            category: String(IdCategory),
            date: brDateToISO(InformedDate),
            startTime: StartTime,
            endTime: EndTime,
            description: Description,
            notMonetize: NotMonetize,
          };
        }
      );

      appointments = await Promise.all(appointmentsPromise);
    } catch (e) {
      console.error('Error on "Get Appointments" process!', e);
    }

    if (appointments.length <= 0) console.error('Appointments not loaded');

    return appointments;
  },
  async search(): Promise<TimesheetAppointment.Row[]> {
    try {
      const response = await timesheetInfos.get();

      if (!response || response.length === 0) return [];

      const { data } = await axios.post<TimesheetAppointment.Row[]>(
        routes.api.timesheet.loadAppointments(),
        response[0]
      );

      return data;
    } catch (e) {
      toast.error('Houve um problema ao carregar os apontamentos!');

      return [];
    }
  },
  schema: appointmentSchema,
};
