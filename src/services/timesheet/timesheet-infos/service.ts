import { toast } from 'react-toastify';

import { supabase } from '@/config/supabase';
import { TimesheetInfos } from '@/services/timesheet/timesheet-infos/types';
import { Timesheet } from '@/services/timesheet/types';
import { User } from '@/store/user/types';

import axios from 'axios';
import { z } from 'zod';

export const timesheetInfos: TimesheetInfos.Service = {
  entity: 'TimesheetInfos',
  async set(
    user: User,
    input: TimesheetInfos.Input
  ): Promise<TimesheetInfos.Row[] | undefined> {
    const {
      data: { iv, content },
    } = await axios.post<Timesheet.CryptoHash>('/api/utils/encrypt', {
      text: input.password,
    });

    const exists = await this.get(user);

    let response;

    if (exists && exists.length > 0) {
      response = await supabase
        .from(this.entity)
        .update({ iv, content, login: input.login })
        .eq('user', user.id)
        .select();
    } else {
      response = await supabase
        .from(this.entity)
        .insert({ user: user.id, iv, content, login: input.login })
        .select();
    }

    const { data, error } = response;

    if (error) return void toast.error(JSON.stringify(error));

    return data;
  },
  async get(user: User): Promise<TimesheetInfos.Row[] | undefined> {
    const { data, error } = await supabase
      .from(this.entity)
      .select()
      .eq('user', user.id);

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  schema: z.object({
    login: z
      .string()
      .nonempty('O e-mail é obrigatório')
      .email('Formato de e-mail inválido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  }),
};
