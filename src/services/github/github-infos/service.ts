import { toast } from 'react-toastify';

import { supabase } from '@/config/supabase';
import { GithubInfos } from '@/services/github/github-infos/types';
import { github } from '@/services/github/service';
import { getUser } from '@/store/user/store';

export const githubInfos: GithubInfos.Service = {
  entity: 'GithubInfos',
  async set(input: GithubInfos.Input): Promise<GithubInfos.Row[] | undefined> {
    const user = getUser();

    if (!user) return;

    const isValid = await github.verifyTokenIsValid(input.token);

    if (!isValid) return;

    const exists = await this.get();

    let response;

    if (exists && exists.length > 0) {
      response = await supabase
        .from(this.entity)
        .update({ token: input.token })
        .eq('user', user.id)
        .select();
    } else {
      response = await supabase
        .from(this.entity)
        .insert({ user: user.id, ...input })
        .select();
    }

    const { data, error } = response;

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async get(): Promise<GithubInfos.Row[] | undefined> {
    const user = getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from(this.entity)
      .select()
      .eq('user', user.id);

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
};
