import { toast } from 'react-toastify';

import { Octokit } from 'octokit';

export const github = {
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
};
