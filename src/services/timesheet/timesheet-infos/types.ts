import { Database } from '@/config/supabase.types';
import { User } from '@/store/user/types';

import { ZodObject, ZodString } from 'zod';

export namespace TimesheetInfos {
  export interface Input {
    login: string;
    password: string;
  }

  export type Row = Database['public']['Tables']['TimesheetInfos']['Row'];

  export interface Service {
    entity: 'TimesheetInfos';
    set(user: User, input: Input): Promise<Row[] | undefined>;
    get(user: User): Promise<Row[] | undefined>;
    schema: ZodObject<{ login: ZodString; password: ZodString }>;
  }

  export interface CryptoHash {
    iv: string;
    content: string;
  }
}
