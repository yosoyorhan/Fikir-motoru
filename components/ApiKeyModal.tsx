import React, { useState } from 'react';
import Logo from './Logo';

interface ApiKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Lütfen bir API anahtarı girin.');
      return;
    }
    setError('');
    onApiKeySubmit(apiKey.trim());
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex justify-center items-center p-4">
      <div className="modal-card w-full max-w-md mx-auto flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Başlamak için API Anahtarı Gerekli
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Lütfen Gemini API anahtarınızı girin. Anahtarınızı Google AI Studio'dan alabilirsiniz.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Gemini API Anahtarı
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="API anahtarınızı buraya yapıştırın"
                autoComplete="off"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              className="w-full gradient-button gradient-strategy-button py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sohbete Başla
            </button>
            <p className="text-xs text-center text-[var(--text-secondary)] mt-4">
              API anahtarınız tarayıcınızın oturum deposunda saklanır ve sunucularımıza gönderilmez.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
