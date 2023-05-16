import { toast } from 'react-toastify';

import { Timesheet } from '@/services/timesheet/types';

import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

export const timesheet: Timesheet.Service = {
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
  async verifyLoginIsValid(input): Promise<boolean> {
    try {
      return Promise.resolve(!!(input.login && input.password));
    } catch (e) {
      toast.error('O token informado é inválido');

      return false;
    }
  },
};
