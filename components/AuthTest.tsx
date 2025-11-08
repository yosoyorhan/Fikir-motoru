import React, { useState, useEffect } from 'react';
import { type User } from '@supabase/supabase-js';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithMagicLink,
  signOut,
  getCurrentUser,
  type AuthState
} from '../services/authService';

export const AuthTest: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { user } = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await signUpWithEmail({ email, password });
    
    if (error) {
      setMessage('Kayıt olma hatası: ' + error.message);
    } else {
      setMessage('Kayıt başarılı! Email onayınızı kontrol edin.');
    }
    setLoading(false);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await signInWithEmail({ email, password });
    
    if (error) {
      setMessage('Giriş hatası: ' + error.message);
    } else {
      setMessage('Giriş başarılı!');
      setUser(data?.user ?? null);
    }
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    
    if (error) {
      setMessage('Magic link hatası: ' + error.message);
    } else {
      setMessage('Magic link gönderildi! Email\'inizi kontrol edin.');
    }
    setLoading(false);
  }

  async function handleSignOut() {
    setLoading(true);
    const { error } = await signOut();
    
    if (error) {
      setMessage('Çıkış hatası: ' + error.message);
    } else {
      setMessage('Çıkış başarılı!');
      setUser(null);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="p-4">Yükleniyor...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {user ? (
        <div className="space-y-4">
          <div className="text-green-600">
            Giriş yapıldı: {user.email}
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Çıkış Yap
          </button>
        </div>
      ) : (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="space-x-4">
            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              Kayıt Ol
            </button>
            <button
              onClick={handleSignIn}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              Giriş Yap
            </button>
            <button
              onClick={handleMagicLink}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              disabled={loading}
            >
              Magic Link Gönder
            </button>
          </div>
        </form>
      )}
      
      {message && (
        <div className={`p-4 rounded ${
          message.includes('hatası') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};