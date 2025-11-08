import { type Database } from '../types/supabase';
import { supabase } from './supabaseClient';

export type Collection = Database['public']['Tables']['collections']['Row'];
export type CollectionInsert = Database['public']['Tables']['collections']['Insert'];
export type CollectionUpdate = Database['public']['Tables']['collections']['Update'];

export const collectionService = {
  async createCollection(collection: CollectionInsert) {
    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getCollection(collectionId: string) {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        *,
        profiles(username, avatar_url),
        ideas_collections(
          ideas(
            *,
            profiles(username, avatar_url)
          )
        )
      `)
      .eq('id', collectionId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserCollections(userId: string) {
    const { data, error } = await supabase
      .from('collections')
      .select('*, profiles(username, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateCollection(collectionId: string, updates: CollectionUpdate) {
    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', collectionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCollection(collectionId: string) {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId);
    
    if (error) throw error;
    return true;
  },

  async addIdeaToCollection(ideaId: string, collectionId: string) {
    const { error } = await supabase
      .from('ideas_collections')
      .insert({
        idea_id: ideaId,
        collection_id: collectionId
      });
    
    if (error) throw error;
    return true;
  },

  async removeIdeaFromCollection(ideaId: string, collectionId: string) {
    const { error } = await supabase
      .from('ideas_collections')
      .delete()
      .match({
        idea_id: ideaId,
        collection_id: collectionId
      });
    
    if (error) throw error;
    return true;
  },

  async searchCollections(query: string, options?: {
    userId?: string;
    isPublic?: boolean;
    limit?: number;
  }) {
    let dbQuery = supabase
      .from('collections')
      .select('*, profiles(username, avatar_url)')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

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