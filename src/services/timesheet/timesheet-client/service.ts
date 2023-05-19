/* eslint-disable no-console */
import { toast } from 'react-toastify';

import { timesheet } from '@/services/timesheet/service';
import { TimesheetClient } from '@/services/timesheet/timesheet-client/types';
import { timesheetInfos } from '@/services/timesheet/timesheet-infos/service';
import { Timesheet } from '@/services/timesheet/types';
import useTimesheetStore from '@/store/timesheet/store';
import { routes } from '@/utils/routes';

import axios, { AxiosRequestConfig } from 'axios';
import { Cookie } from 'tough-cookie';

export const timesheetClient: TimesheetClient.Service = {
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

  async loadCategories(
    projectId: Timesheet.Project['id'],
    cookies: Cookie[]
  ): Promise<Timesheet.Category[]> {
    try {
      const { data } = await axios.post<{ Id: number; Name: string }[]>(
        '/Worksheet/ReadCategory',
        `idproject=${projectId}`,
        this.configRequest(cookies)
      );

      return data.map(({ Id, Name }) => ({ id: Id, name: Name }));
    } catch (e) {
      console.error(`Error on get Categories from "${projectId}" process!`, e);

      return [];
    }
  },

  async loadProjects(
    clientId: Timesheet.Client['id'],
    cookies: Cookie[]
  ): Promise<Timesheet.Project[]> {
    try {
      const { data } = await axios.post<
        {
          Id: number;
          Name: string;
          StartDate: string;
          EndDate: string;
          IdCustomer: number;
        }[]
      >(
        '/Worksheet/ReadProject',
        `idcustomer=${clientId}`,
        this.configRequest(cookies)
      );

      const promise = data.map(async (p) => ({
        ...p,
        categories: await this.loadCategories(p.Id, cookies),
      }));
      const projects = await Promise.all(promise);

      return projects.map((p) => ({
        id: p.Id,
        name: p.Name,
        startDate: p.StartDate,
        endDate: p.EndDate,
        categories: p.categories,
      }));
    } catch (e) {
      console.error(`Error on get Projects from "${clientId}" process!`, e);

      return [];
    }
  },

  async loadClients(cookies: Cookie[]): Promise<Timesheet.Client[]> {
    const clients: Timesheet.Client[] = [];

    try {
      const response = await axios.get(
        '/Worksheet/Read',
        this.configRequest(cookies)
      );

      const html: string = response.data;

      const regex = /(name="IdCustomer">)([\w\W]+?)(<\/select>)/gm;
      const search: string = (html.match(regex) || [''])[0];

      const cleanedSearch = search.split(/\r\n/gm).join('');

      const values = cleanedSearch.match(/value="([\S\s]+?)??">([\S\s]+?)</g);

      if (!values) {
        if (html.match('<div class="login-content">'))
          console.error('Cookies are invalid!');
        else console.error('Options not found!');

        return [];
      }

      const clientsPromise: Promise<Timesheet.Client>[] = values.map(
        async (option) => {
          const [id, title] = option
            .replace(/value="([\S\s]+?)??">([\S\s]+?)</g, '$1|$2')
            .split('|');

          const projects = await this.loadProjects(id, cookies);

          if (id) clients.push({ id, title, projects });

          return { id: id || '-1', title, projects };
        }
      );

      await Promise.all(clientsPromise);
    } catch (e) {
      console.error('Error on Get Clients process!', e);
    }

    if (clients.length <= 0) console.error('Clients not loaded');

    return clients;
  },

  async getAll(): Promise<Timesheet.Client[]> {
    timesheet.enableLoading();
    try {
      const response = await timesheetInfos.get();

      if (!response || response.length === 0) return [];

      const { data } = await axios.post<Timesheet.Client[]>(
        routes.api.timesheet.loadClients(),
        response[0]
      );

      useTimesheetStore.setState({ clients: data });

      return data;
    } catch (e) {
      toast.error('Houve um problema ao carregar os clientes!');

      return [];
    } finally {
      timesheet.disableLoading();
    }
  },
};
