import { toast } from 'react-toastify';

import { Timesheet } from '@/services/timesheet/types';
import { routes } from '@/utils/routes';

import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { Cookie, CookieJar } from 'tough-cookie';
import { promisify } from 'util';

const home = `https://luby-timesheet.azurewebsites.net`;

export const timesheet: Timesheet.Service = {
  routes: {
    home,
    accountLogin: `${home}/Account/Login`,
    homeIndex: `${home}/Home/Index`,
    worksheetRead: `${home}/Worksheet/Read`,
    controlPanelManagerDeveloper: `${home}/ControlPanel/ManagerDeveloper`,
  },
  async encryptPassword(text): Promise<Timesheet.CryptoHash> {
    const iv = randomBytes(16);

    const key: Buffer = (await promisify(scrypt)(
      `${process.env.AZURE_SECRET}`,
      'salt',
      32
    )) as Buffer;

    const cipher = createCipheriv('aes-256-ctr', key, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
      iv: iv.toString('hex'),
      content: encrypted.toString('hex'),
    };
  },
  async loadCookies(login: string, password: string): Promise<Cookie[]> {
    try {
      const response = await axios.get(this.routes.accountLogin);

      const regex = /value="([\S\s]+?)??" \/>/g;
      const regexResult = regex.exec(response.data);

      if (!regexResult || regexResult.length === 0) return [];

      const token = regexResult[1];

      const setCookie = response.headers['set-cookie'];

      if (!setCookie || setCookie.length === 0) return [];

      const requestToken = setCookie.find((ck) =>
        ck.includes('__RequestVerificationToken')
      );

      if (!requestToken) return [];

      const verificationToken = requestToken.split(';')[0].split('=')[1];

      const cookieJar = new CookieJar();

      wrapper(axios);

      await axios.post(
        this.routes.accountLogin,
        `__RequestVerificationToken=${token}&Login=${login}&Password=${password}`,
        {
          headers: {
            cookie: `__RequestVerificationToken=${verificationToken};`,
          },
          jar: cookieJar,
          withCredentials: true,
        }
      );

      const { cookies } = cookieJar.toJSON();

      if (cookies.find(({ key }) => key === 'ec')) return cookies as Cookie[];
      else return [];
    } catch (e) {
      toast.error('Erro ao tentar autenticar!');

      return [];
    }
  },
  async verifyLoginIsValid(input): Promise<boolean> {
    try {
      if (!input.login || !input.password) {
        return false;
      }

      const { data } = await axios.post<Cookie[]>(
        routes.api.timesheet.loadCookies(),
        input
      );

      return data.length > 0;
    } catch (e) {
      toast.error('A autenticação informada é inválida!');

      return false;
    }
  },
};
