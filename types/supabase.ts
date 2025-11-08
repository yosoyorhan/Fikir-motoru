export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          settings: Json | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          settings?: Json | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          settings?: Json | null
        }
      }
      ideas: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          status: string
          user_id: string
          metadata: Json
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          status?: string
          user_id: string
          metadata?: Json
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          status?: string
          user_id?: string
          metadata?: Json
          is_public?: boolean
        }
      }
      collections: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          user_id: string
          is_public: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          user_id: string
          is_public?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          user_id?: string
          is_public?: boolean
        }
      }
      ideas_collections: {
        Row: {
          idea_id: string
          collection_id: string
          added_at: string
        }
        Insert: {
          idea_id: string
          collection_id: string
          added_at?: string
        }
        Update: {
          idea_id?: string
          collection_id?: string
          added_at?: string
        }
      }
    }
    Views: {
      // View tanımları eklenebilir
    }
    Functions: {
      // Stored procedure tanımları eklenebilir
    }
    Enums: {
      // Enum tanımları eklenebilir
    }
  }
}