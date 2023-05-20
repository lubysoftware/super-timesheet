import { timesheet } from '@/services/timesheet/service';
import { timesheetAppointment } from '@/services/timesheet/timesheet-appointment/service';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { ApiRoute } from '@/utils/routes';

import axios from 'axios';
import * as he from 'he';

const handler: ApiRoute<
  TimesheetAppointment.Output[],
  TimesheetAppointment.ApiInput
> = async (req, res) => {
  switch (req.method) {
    case 'POST':
      try {
        const { iv, content, login } = req.body;

        const password = await timesheet.decryptPassword({ iv, content });

        const cookies = await timesheet.loadCookies(login, password);

        const response = await axios.get(
          '/Worksheet/Read',
          timesheetAppointment.configRequest(cookies)
        );

        const regex =
          /name="__RequestVerificationToken" type="hidden" value="([\S\s]+?)??" \/>/g;
        const regexResult = regex.exec(response.data);

        if (!regexResult || regexResult.length === 0)
          return res.status(200).json([]);

        const __RequestVerificationToken = regexResult[1];

        const cookie: string = cookies.reduce(
          (previous, { key, value }) => `${previous} ${key}=${value};`,
          ''
        );

        const WebKitFormBoundary = 'MAKEaAppoINtmEnB';

        const promise = req.body.appointments.map(
          async (appointment): Promise<TimesheetAppointment.Output> => {
            const { data } = await axios.post<string>(
              'https://luby-timesheet.azurewebsites.net/Worksheet/Update',
              timesheetAppointment.makeBody(WebKitFormBoundary, {
                ...timesheetAppointment.appointmentParse(appointment),
                __RequestVerificationToken,
              }),
              {
                headers: {
                  accept:
                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                  'cache-control': 'max-age=0',
                  'content-type': `multipart/form-data; boundary=----WebKitFormBoundary${WebKitFormBoundary}`,
                  'sec-ch-ua':
                    '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                  'sec-ch-ua-mobile': '?0',
                  'sec-ch-ua-platform': '"Windows"',
                  'sec-fetch-dest': 'document',
                  'sec-fetch-mode': 'navigate',
                  'sec-fetch-site': 'same-origin',
                  'sec-fetch-user': '?1',
                  'upgrade-insecure-requests': '1',
                  cookie,
                  Referer:
                    'https://luby-timesheet.azurewebsites.net/Worksheet/Read',
                  'Referrer-Policy': 'strict-origin-when-cross-origin',
                },
              }
            );

            const regexError =
              /<div class="alert alert-danger">([\S\s]+?)??<a/gm;
            const errorResult = regexError.exec(data);

            return {
              ...appointment,
              success: !errorResult,
              errorMessage: errorResult ? he.decode(errorResult[1]) : undefined,
            };
          }
        );

        const result = await Promise.all(promise);

        res.status(200).json(result);
      } catch (e) {
        res.status(500).json({ message: `${JSON.stringify(e)}` });
      }
      break;
    default:
      res.status(500).json({ message: 'Esse método não foi implementado!' });
      break;
  }
};

export default handler;
