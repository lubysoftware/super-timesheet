import { timesheet } from '@/services/timesheet/service';
import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';
import { ApiRoute } from '@/utils/routes';

import { Cookie } from 'tough-cookie';

const handler: ApiRoute<Cookie[], TimesheetInfos.Input> = async (req, res) => {
  switch (req.method) {
    case 'POST':
      try {
        const cookies = await timesheet.loadCookies(
          req.body.login,
          req.body.password
        );

        res.status(200).json(cookies);
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
