import { toast } from 'react-toastify';

import { supabase } from '@/config/supabase';
import { GithubBranch } from '@/services/github/github-branch/types';
import { githubInfos } from '@/services/github/github-infos/service';
import { githubRepository } from '@/services/github/github-repository/service';
import { GithubRepository } from '@/services/github/github-repository/types';
import { getUser } from '@/store/user/store';

import { Octokit } from 'octokit';

export const githubBranch: GithubBranch.Service = {
  entity: 'GithubBranch',
  async set(
    input: GithubBranch.Input
  ): Promise<GithubBranch.Row[] | undefined> {
    const repositories = await githubRepository.get(input.repository);

    if (!repositories || repositories.length === 0) {
      toast.error('Repositório inválido');

      return [];
    }

    const repository = repositories[0].id;

    const exists = await this.get(repository);

    const sha = await this.verifyBranchIsValid(input.repository, input.name);

    if (!sha) return [];

    let response;

    if (exists && exists.length > 0) {
      response = await supabase
        .from(this.entity)
        .update({ name: input.name, sha })
        .eq('repository', repository)
        .select();
    } else {
      response = await supabase
        .from(this.entity)
        .insert({ name: input.name, sha, repository })
        .select();
    }

    const { data, error } = response;

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async get(
    repository: GithubRepository.Row['id']
  ): Promise<GithubBranch.Row[] | undefined> {
    const { data, error } = await supabase
      .from(this.entity)
      .select()
      .eq('repository', repository);

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async verifyBranchIsValid(
    repository: string,
    branch: string
  ): Promise<string | undefined> {
    try {
      const user = getUser();

      if (!user) return;

      const infos = await githubInfos.get(user);

      if (!infos) return;

      const octokit = new Octokit({ auth: infos[0].token });

      const [owner, repo] = repository.split('/');

      const response = await octokit.request(
        'GET /repos/{owner}/{repo}/branches/{branch}',
        { owner, repo, branch }
      );

      return response.data.commit.sha;
    } catch (e) {
      toast.error('A branch informada é inválida');
    }
  },
};
