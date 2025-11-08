import { createClient, Session, User } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';
import { SavedIdea, GameData } from '../types';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided in config.ts');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const auth = {
  signUp: (credentials: { email, password }) => supabase.auth.signUp(credentials),
  signInWithPassword: (credentials: { email, password }) => supabase.auth.signInWithPassword(credentials),
  signInWithGoogle: () => supabase.auth.signInWithOAuth({ provider: 'google' }),
  signOut: () => supabase.auth.signOut(),
  onAuthStateChange: (callback: (session: Session | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return subscription;
  },
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user ?? null;
  }
};

export const db = {
  getSavedIdeas: async (userId: string): Promise<SavedIdea[]> => {
    const { data, error } = await supabase
      .from('saved_ideas')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },
  addSavedIdea: async (idea: Omit<SavedIdea, 'id'>, userId: string): Promise<SavedIdea> => {
    const { data, error } = await supabase
      .from('saved_ideas')
      .insert({ ...idea, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  updateIdeaStatus: async (ideaId: string, status: string, userId: string): Promise<SavedIdea> => {
    const { data, error } = await supabase
      .from('saved_ideas')
      .update({ status })
      .eq('id', ideaId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  getGameData: async (userId: string): Promise<GameData | null> => {
    const { data, error } = await supabase
      .from('game_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },
  updateGameData: async (gameData: GameData, userId: string): Promise<GameData> => {
    const { data, error } = await supabase
      .from('game_data')
      .upsert({ ...gameData, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
