import type { NextApiRequest, NextApiResponse } from 'next';

import { timesheet } from '@/services/timesheet/service';
import { Timesheet } from '@/services/timesheet/types';

type NextApiRoute<T = unknown> = (
  request: NextApiRequest,
  response: NextApiResponse<T | { message: string }>
) => void | Promise<void>;

const handler: NextApiRoute<Timesheet.CryptoHash> = async (req, res) => {
  switch (req.method) {
    case 'POST':
      try {
        const encrypted = await timesheet.encryptPassword(req.body.text);

        res.status(200).json(encrypted);
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
