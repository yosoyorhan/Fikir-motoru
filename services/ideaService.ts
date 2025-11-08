import { type Database } from '../types/supabase';
import { supabase } from './supabaseClient';

export type Idea = Database['public']['Tables']['ideas']['Row'];
export type IdeaInsert = Database['public']['Tables']['ideas']['Insert'];
export type IdeaUpdate = Database['public']['Tables']['ideas']['Update'];

export const ideaService = {
  async createIdea(idea: IdeaInsert) {
    const { data, error } = await supabase
      .from('ideas')
      .insert(idea)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getIdea(ideaId: string) {
    const { data, error } = await supabase
      .from('ideas')
      .select('*, profiles(username, avatar_url)')
      .eq('id', ideaId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserIdeas(userId: string, options?: { 
    status?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('ideas')
      .select('*, profiles(username, avatar_url)')
      .eq('user_id', userId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    
    if (typeof options?.isPublic === 'boolean') {
      query = query.eq('is_public', options.isPublic);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateIdea(ideaId: string, updates: IdeaUpdate) {
    const { data, error } = await supabase
      .from('ideas')
      .update(updates)
      .eq('id', ideaId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteIdea(ideaId: string) {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);
    
    if (error) throw error;
    return true;
  },

  async searchIdeas(query: string, options?: {
    userId?: string;
    isPublic?: boolean;
    limit?: number;
  }) {
    let dbQuery = supabase
      .from('ideas')
      .select('*, profiles(username, avatar_url)')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (options?.userId) {
      dbQuery = dbQuery.eq('user_id', options.userId);
    } else if (typeof options?.isPublic === 'boolean') {
      dbQuery = dbQuery.eq('is_public', options.isPublic);
    }

    if (options?.limit) {
      dbQuery = dbQuery.limit(options.limit);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};