import { useState, useEffect } from 'react';
import { type User } from '@supabase/supabase-js';
import { profileService, type Profile } from '../services/profileService';
import { ideaService, type Idea } from '../services/ideaService';
import { collectionService, type Collection } from '../services/collectionService';

// Profile Hooks
export const useProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await profileService.getProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await profileService.updateProfile(userId, updates);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
};

// Ideas Hooks
export const useIdeas = (userId: string | undefined, options?: Parameters<typeof ideaService.getUserIdeas>[1]) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    const fetchIdeas = async () => {
      try {
        const data = await ideaService.getUserIdeas(userId, options);
        setIdeas(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [userId, options]);

  const createIdea = async (idea: Omit<Idea, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await ideaService.createIdea({ ...idea, user_id: userId });
      setIdeas(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIdea = async (ideaId: string, updates: Partial<Idea>) => {
    setLoading(true);
    try {
      const data = await ideaService.updateIdea(ideaId, updates);
      setIdeas(prev => prev.map(idea => idea.id === ideaId ? data : idea));
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteIdea = async (ideaId: string) => {
    setLoading(true);
    try {
      await ideaService.deleteIdea(ideaId);
      setIdeas(prev => prev.filter(idea => idea.id !== ideaId));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { ideas, loading, error, createIdea, updateIdea, deleteIdea };
};

// Collections Hooks
export const useCollections = (userId: string | undefined) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setCollections([]);
      setLoading(false);
      return;
    }

    const fetchCollections = async () => {
      try {
        const data = await collectionService.getUserCollections(userId);
        setCollections(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [userId]);

  const createCollection = async (collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await collectionService.createCollection({ ...collection, user_id: userId });
      setCollections(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCollection = async (collectionId: string, updates: Partial<Collection>) => {
    setLoading(true);
    try {
      const data = await collectionService.updateCollection(collectionId, updates);
      setCollections(prev => prev.map(collection => collection.id === collectionId ? data : collection));
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCollection = async (collectionId: string) => {
    setLoading(true);
    try {
      await collectionService.deleteCollection(collectionId);
      setCollections(prev => prev.filter(collection => collection.id !== collectionId));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addIdeaToCollection = async (ideaId: string, collectionId: string) => {
    try {
      await collectionService.addIdeaToCollection(ideaId, collectionId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const removeIdeaFromCollection = async (ideaId: string, collectionId: string) => {
    try {
      await collectionService.removeIdeaFromCollection(ideaId, collectionId);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    collections,
    loading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addIdeaToCollection,
    removeIdeaFromCollection
  };
};