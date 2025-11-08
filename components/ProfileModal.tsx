import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Profile, User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: Profile | null;
  onProfileUpdate: (updatedProfile: Partial<Profile>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, profile, onProfileUpdate }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  if (!isOpen || !user || !profile) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setMessage(`Hata: ${error.message}`);
    } else if (data) {
      onProfileUpdate(data);
      setMessage('Profil başarıyla güncellendi!');
      setTimeout(() => onClose(), 1500);
    }
    setLoading(false);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in p-4" onClick={onClose}>
      <div className="modal-card w-full max-w-md mx-auto flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Profilim</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              E-posta
            </label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-between items-center bg-[var(--bg-primary)] p-4 rounded-lg">
            <div className="text-center">
                <span className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{profile.points}</span>
                <span className="text-xs text-[var(--text-secondary)]">PUAN</span>
            </div>
             <div className="text-center">
                <span className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{profile.level}</span>
                <span className="text-xs text-[var(--text-secondary)]">SEVİYE</span>
            </div>
          </div>
          
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-auth-button py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;