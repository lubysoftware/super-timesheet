import { Database } from '@/config/supabase.types';
import { GithubBranch } from '@/services/github/github-branch/types';

export namespace GithubRepository {
  export interface Input {
    fullName: string;
  }

  export type Row = Database['public']['Tables']['GithubRepository']['Row'] & {
    branch?: GithubBranch.Row;
  };

  export interface Service {
    entity: 'GithubRepository';
    set(input: Input): Promise<Row[] | undefined>;
    get(fullName: string): Promise<Row[] | undefined>;
    getAll(): Promise<GithubRepository.Row[]>;
    delete(fullName: string): Promise<boolean>;
  }
}
