import { Database } from '@/config/supabase.types';
import { GithubRepository } from '@/services/github/github-repository/types';

export namespace GithubBranch {
  export interface Input {
    repository: string;
    name: string;
  }

  export type Row = Database['public']['Tables']['GithubBranch']['Row'];

  export interface Service {
    entity: 'GithubBranch';
    set(input: Input): Promise<Row[] | undefined>;
    get(repository: GithubRepository.Row['id']): Promise<Row[] | undefined>;
    verifyBranchIsValid(
      repository: string,
      branch: string
    ): Promise<string | undefined>;
  }
}
