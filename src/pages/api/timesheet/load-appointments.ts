import { timesheet } from '@/services/timesheet/service';
import { timesheetAppointment } from '@/services/timesheet/timesheet-appointment/service';
import { TimesheetAppointment } from '@/services/timesheet/timesheet-appointment/types';
import { TimesheetClient } from '@/services/timesheet/timesheet-client/types';
import { ApiRoute } from '@/utils/routes';

const handler: ApiRoute<
  TimesheetAppointment.Row[],
  TimesheetClient.Input
> = async (req, res) => {
  switch (req.method) {
    case 'POST':
      try {
        const { iv, content, login } = req.body;

        const password = await timesheet.decryptPassword({ iv, content });

        const cookies = await timesheet.loadCookies(login, password);

        const appointments = await timesheetAppointment.load(cookies);

        res.status(200).json(appointments);
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
