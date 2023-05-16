export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      GithubInfos: {
        Row: {
          id: number;
          token: string;
          user: string;
        };
        Insert: {
          id?: number;
          token: string;
          user: string;
        };
        Update: {
          id?: number;
          token?: string;
          user?: string;
        };
      };
      TimesheetInfos: {
        Row: {
          content: string;
          id: number;
          iv: string;
          login: string;
          user: string;
        };
        Insert: {
          content: string;
          id?: number;
          iv: string;
          login: string;
          user: string;
        };
        Update: {
          content?: string;
          id?: number;
          iv?: string;
          login?: string;
          user?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
