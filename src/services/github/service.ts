/* eslint-disable camelcase */
import { toast } from 'react-toastify';

import { githubInfos } from '@/services/github/github-infos/service';
import { Github } from '@/services/github/types';
import { getUser } from '@/store/user/store';

import { Octokit } from 'octokit';

export const github: Github.Service = {
  async verifyTokenIsValid(token: string): Promise<boolean> {
    try {
      const octokit = new Octokit({ auth: token });

      await octokit.request('GET /user');

      return true;
    } catch (e) {
      toast.error('O token informado é inválido');

      return false;
    }
  },
  async loadRepositories(): Promise<Github.SimpleRepository[]> {
    const user = getUser();

    if (!user) return [];

    const infos = await githubInfos.get();

    if (!infos) return [];

    const octokit = new Octokit({ auth: infos[0].token });

    const get = async (): Promise<Github.Repositories> => {
      let aux: Github.Repositories = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request('GET /user/repos', {
          per_page: 100,
          sort: 'pushed',
          page,
        });

        aux = aux.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

      return aux;
    };

    const data = await get();

    return data.map(
      ({ full_name, name, owner }): Github.SimpleRepository => ({
        fullName: full_name,
        name,
        ownerLogin: owner.login,
        ownerAvatar: owner.avatar_url,
      })
    );
  },
  async loadBranches(
    repository: Github.SimpleRepository['fullName']
  ): Promise<Github.SimpleBranch[]> {
    const user = getUser();

    if (!user) return [];

    const [owner, repo] = repository.split('/');

    const infos = await githubInfos.get();

    if (!infos) return [];

    const octokit = new Octokit({ auth: infos[0].token });

    const get = async (): Promise<Github.Branches> => {
      let aux: Github.Branches = [];

      const request = async (page: number): Promise<void> => {
        const response = await octokit.request(
          'GET /repos/{owner}/{repo}/branches',
          { owner, repo, per_page: 100, page }
        );

        aux = aux.concat(response.data);

        if (response.headers.link && response.headers.link.includes('last'))
          await request(page + 1);
      };

      await request(1);

      return aux;
    };

    const branches = await get();

    return branches.map(
      ({ name, commit }): Github.SimpleBranch => ({ name, sha: commit.sha })
    );
  },
};
