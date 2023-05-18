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
      GithubBranch: {
        Row: {
          id: number;
          name: string;
          repository: number;
          sha: string;
        };
        Insert: {
          id?: number;
          name: string;
          repository: number;
          sha: string;
        };
        Update: {
          id?: number;
          name?: string;
          repository?: number;
          sha?: string;
        };
      };
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
      GithubRepository: {
        Row: {
          fullName: string;
          id: number;
          user: string;
        };
        Insert: {
          fullName: string;
          id?: number;
          user: string;
        };
        Update: {
          fullName?: string;
          id?: number;
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
      TimesheetProject: {
        Row: {
          clientCode: number;
          clientName: string;
          id: number;
          projectCode: number;
          projectName: string;
          repository: number;
        };
        Insert: {
          clientCode: number;
          clientName: string;
          id?: number;
          projectCode: number;
          projectName: string;
          repository: number;
        };
        Update: {
          clientCode?: number;
          clientName?: string;
          id?: number;
          projectCode?: number;
          projectName?: string;
          repository?: number;
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
