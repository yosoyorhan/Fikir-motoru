import React, { useState, useEffect } from 'react';
import { db } from '../services/supabaseService';
import { Profile } from '../types';
import Icon from './Icon';
import { X, User, Mail, Save } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Profile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, session, profile, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setFullName(profile.full_name || '');
      setWebsite(profile.website || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!session) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const updatedProfile = await db.updateProfile(session.user.id, {
        username,
        full_name: fullName,
        website,
      });
      onProfileUpdate(updatedProfile);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 relative transform transition-all duration-300 scale-95 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Icon icon={X} size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-light-heading gradient-title">Profil</h2>
        </div>

        {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-500/20 text-green-400 text-sm p-3 rounded-lg mb-4 text-center">{success}</p>}

        <form onSubmit={handleUpdateProfile}>
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                <Icon icon={Mail} size={20} />
              </span>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-3 pl-10 pr-4 text-[var(--text-secondary)]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                <Icon icon={User} size={20} />
              </span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition-colors"
              />
            </div>
            {/* Add more profile fields as needed */}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Icon icon={Save} size={20} />
            {loading ? 'Kaydediliyor...' : 'Profili Güncelle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
