import { Database } from '@/config/supabase.types';
import { User } from '@/store/user/types';

export namespace GithubInfos {
  export interface E {
    id: string;
    token: string;
    user: string;
  }

  export interface Input {
    token: string;
  }

  export type Row = Database['public']['Tables']['GithubInfos']['Row'];

  export interface Service {
    entity: 'GithubInfos';
    set(user: User, input: Input): Promise<Row[] | undefined>;
    get(user: User): Promise<Row[] | undefined>;
  }
}
