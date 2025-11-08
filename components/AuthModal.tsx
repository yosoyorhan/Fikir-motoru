import React, { useState } from 'react';
import Logo from './Logo';
import { supabase } from '../services/supabaseClient';

interface AuthModalProps {
  onSuccess: () => void;
  onGuest: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onGuest }) => {
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username
            }
          }
        });
        if (error) throw error;
        if (data.user) {
           setMessage('Hesabınız oluşturuldu. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.');
        }
      }

    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex justify-center items-center p-4" style={{ backgroundColor: '#0B0B0C' }}>
      <div className="modal-card w-full max-w-md mx-auto flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <Logo />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {message ? 'Onay Gerekli' : 'Zihnini aç, giriş yap'}
              </h2>
               {message && <p className="text-green-400 mt-4">{message}</p>}
            </div>

            {!message && (
               <form onSubmit={handleAuth}>
                <div className="mb-6 flex justify-center border border-[var(--border-color)] rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => { setView('sign_in'); setError(null); }}
                    className={`w-1/2 py-2 rounded-md transition-colors ${view === 'sign_in' ? 'bg-[var(--border-color)] text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}
                  >
                    Giriş Yap
                  </button>
                  <button
                    type="button"
                    onClick={() => { setView('sign_up'); setError(null); }}
                    className={`w-1/2 py-2 rounded-md transition-colors ${view === 'sign_up' ? 'bg-[var(--border-color)] text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}
                  >
                    Hesap Oluştur
                  </button>
                </div>

                <div className="space-y-4">
                   {view === 'sign_up' && (
                     <div>
                        <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                          Kullanıcı Adı
                        </label>
                        <input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                          placeholder="kullanici_adiniz"
                          required
                        />
                      </div>
                   )}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      E-posta
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="ornek@eposta.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password"className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      Şifre (en az 6 karakter)
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </div>
                
                <div className="mt-8 space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full gradient-auth-button py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {loading ? 'Yükleniyor...' : (view === 'sign_in' ? 'Giriş Yap' : 'Kayıt Ol')}
                  </button>
                  <button
                    type="button"
                    onClick={onGuest}
                    className="w-full text-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2"
                  >
                    Misafir olarak devam et
                  </button>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;