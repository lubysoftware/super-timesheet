import { Database } from '@/config/supabase.types';

export namespace GithubInfos {
  export interface Input {
    token: string;
  }

  export type Row = Database['public']['Tables']['GithubInfos']['Row'];

  export interface Service {
    entity: 'GithubInfos';
    set(input: Input): Promise<Row[] | undefined>;
    get(): Promise<Row[] | undefined>;
  }
}
