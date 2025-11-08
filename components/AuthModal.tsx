import React, { useState } from 'react';
import { auth } from '../services/supabaseService';
import Icon from './Icon';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error } = await auth.signUp({ email, password });
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Hesabınız oluşturuldu! Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.');
        }
      } else {
        const { error } = await auth.signInWithPassword({ email, password });
        if (error) {
          setError(error.message);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl p-8 max-w-sm w-full m-4 relative transform transition-all duration-300 scale-95 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Icon icon={X} size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-light-heading gradient-title">Zihnini aç, giriş yap</h2>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">
            {isSignUp ? 'Yeni bir hesap oluşturun.' : 'Fikirlerinizi kaydetmek için giriş yapın.'}
          </p>
        </div>

        {error && <p className="bg-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-500/20 text-green-400 text-sm p-3 rounded-lg mb-4 text-center">{success}</p>}

        {!success && (
          <>
            <form onSubmit={handleAuthAction}>
              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Icon icon={Mail} size={20} />
                  </span>
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                    <Icon icon={Lock} size={20} />
                  </span>
                  <input
                    type="password"
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icon icon={isSignUp ? UserPlus : LogIn} size={20} />
                {loading ? 'İşleniyor...' : (isSignUp ? 'Hesap Oluştur' : 'Giriş Yap')}
              </button>
            </form>

            <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-[var(--border-color)]" />
                <span className="mx-4 text-xs text-[var(--text-secondary)]">VEYA</span>
                <hr className="flex-grow border-t border-[var(--border-color)]" />
            </div>

            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold py-3 rounded-lg hover:bg-[var(--border-color)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <img src="https://psikominik.com/test/Google__G__logo.svg.png" alt="Google logo" className="w-5 h-5"/>
              Google ile Devam Et
            </button>

            <div className="text-center mt-6">
              <button onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }} className="text-sm text-[var(--text-secondary)] hover:text-[#A78BFA] transition-colors">
                {isSignUp ? 'Zaten hesabınız var mı? Giriş Yapın.' : 'Hesabınız yok mu? Oluşturun.'}
              </button>
            </div>
          </>
        )}

        <div className="text-center mt-8">
            <button onClick={onClose} className="text-xs text-[var(--text-secondary)] hover:underline">
                {success ? 'Kapat' : 'Misafir olarak devam et'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
