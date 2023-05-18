import { toast } from 'react-toastify';

import { supabase } from '@/config/supabase';
import { githubBranch } from '@/services/github/github-branch/service';
import { GithubRepository } from '@/services/github/github-repository/types';
import { getUser } from '@/store/user/store';

export const githubRepository: GithubRepository.Service = {
  entity: 'GithubRepository',
  async set(
    input: GithubRepository.Input
  ): Promise<GithubRepository.Row[] | undefined> {
    const user = getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from(this.entity)
      .insert({ user: user.id, ...input })
      .select();

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async get(fullName: string): Promise<GithubRepository.Row[] | undefined> {
    const user = getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from(this.entity)
      .select()
      .eq('user', user.id)
      .eq('fullName', fullName);

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async getAll(): Promise<GithubRepository.Row[]> {
    const user = getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from(this.entity)
      .select()
      .eq('user', user.id);

    if (error) {
      toast.error(JSON.stringify(error));

      return [];
    }

    if (data) {
      const promise = data.map(async (repo) => {
        const branch = await githubBranch.get(repo.id);

        return branch ? { ...repo, branch: branch[0] } : repo;
      });

      return await Promise.all(promise);
    }

    return data;
  },
  async delete(fullName: string): Promise<boolean> {
    const user = getUser();

    if (!user) return false;

    const { error } = await supabase
      .from(this.entity)
      .delete()
      .eq('user', user.id)
      .eq('fullName', fullName);

    if (error) {
      void toast.error(JSON.stringify(error));

      return false;
    }

    return true;
  },
};
