import { Database } from '@/config/supabase.types';

export namespace TimesheetProject {
  export interface Input {
    repository: string;
    client: { code: number; name: string };
    project: { code: number; name: string };
  }

  export type Row = Database['public']['Tables']['TimesheetProject']['Row'];

  export interface Service {
    entity: 'TimesheetProject';
    set(input: Input): Promise<Row[] | undefined>;
    get(repository: Row['id']): Promise<Row[] | undefined>;
  }
}
