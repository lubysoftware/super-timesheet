import { Database } from '@/config/supabase.types';
import { GithubBranch } from '@/services/github/github-branch/types';
import { User } from '@/store/user/types';

export namespace GithubRepository {
  export interface Input {
    fullName: string;
  }

  export type Row = Database['public']['Tables']['GithubRepository']['Row'] & {
    branch?: GithubBranch.Row;
  };

  export interface Service {
    entity: 'GithubRepository';
    set(user: User, input: Input): Promise<Row[] | undefined>;
    get(user: User, fullName: string): Promise<Row[] | undefined>;
    getAll(user: User): Promise<GithubRepository.Row[]>;
    delete(user: User, fullName: string): Promise<boolean>;
  }
}
