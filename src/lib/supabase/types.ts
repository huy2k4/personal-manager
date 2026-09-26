export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          time: string;
          category: 'work' | 'freelance' | 'study' | 'personal';
          priority: 'high' | 'medium' | 'low';
          done: boolean;
          created_at: string;
          user_id?: string;
        };
        Insert: {
          id?: string;
          title: string;
          time: string;
          category: 'work' | 'freelance' | 'study' | 'personal';
          priority?: 'high' | 'medium' | 'low';
          done?: boolean;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          time?: string;
          category?: 'work' | 'freelance' | 'study' | 'personal';
          priority?: 'high' | 'medium' | 'low';
          done?: boolean;
          created_at?: string;
          user_id?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          client: string;
          project: string;
          deadline: string;
          progress: number;
          status: 'active' | 'review' | 'done';
          earned: number;
          total: number;
          created_at: string;
          user_id?: string;
        };
        Insert: {
          id?: string;
          client: string;
          project: string;
          deadline: string;
          progress?: number;
          status?: 'active' | 'review' | 'done';
          earned?: number;
          total?: number;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          client?: string;
          project?: string;
          deadline?: string;
          progress?: number;
          status?: 'active' | 'review' | 'done';
          earned?: number;
          total?: number;
          created_at?: string;
          user_id?: string;
        };
      };
      work_projects: {
        Row: {
          id: string;
          name: string;
          tagline: string;
          type: 'fulltime' | 'project';
          accent_color: string;
          logo_url?: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          tagline: string;
          type: 'fulltime' | 'project';
          accent_color: string;
          logo_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tagline?: string;
          type?: 'fulltime' | 'project';
          accent_color?: string;
          logo_url?: string;
          created_at?: string;
        };
      };
      project_schedules: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          time: string;
          date: string;
          done: boolean;
          note?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          time: string;
          date: string;
          done?: boolean;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          time?: string;
          date?: string;
          done?: boolean;
          note?: string;
          created_at?: string;
        };
      };
    };
  };
}
