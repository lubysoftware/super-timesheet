import { toast } from 'react-toastify';

import { supabase } from '@/config/supabase';
import { githubBranch } from '@/services/github/github-branch/service';
import { GithubRepository } from '@/services/github/github-repository/types';
import { User } from '@/store/user/types';

export const githubRepository: GithubRepository.Service = {
  entity: 'GithubRepository',
  async set(
    user: User,
    input: GithubRepository.Input
  ): Promise<GithubRepository.Row[] | undefined> {
    const { data, error } = await supabase
      .from(this.entity)
      .insert({ user: user.id, ...input })
      .select();

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async get(
    user: User,
    fullName: string
  ): Promise<GithubRepository.Row[] | undefined> {
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
  async getAll(user: User): Promise<GithubRepository.Row[]> {
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
  async delete(user: User, fullName: string): Promise<boolean> {
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
