import { timesheet } from '@/services/timesheet/service';
import { timesheetClient } from '@/services/timesheet/timesheet-client/service';
import { TimesheetClient } from '@/services/timesheet/timesheet-client/types';
import { Timesheet } from '@/services/timesheet/types';
import { ApiRoute } from '@/utils/routes';

const handler: ApiRoute<Timesheet.Client[], TimesheetClient.Input> = async (
  req,
  res
) => {
  switch (req.method) {
    case 'POST':
      try {
        const { iv, content, login } = req.body;

        const password = await timesheet.decryptPassword({ iv, content });

        const cookies = await timesheet.loadCookies(login, password);

        const clients = await timesheetClient.loadClients(cookies);

        res.status(200).json(clients);
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
