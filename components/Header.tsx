import React, { useState } from 'react';
import { AppState, Theme, User } from '../types';
import Logo from './Logo';

interface HeaderProps {
  appState: AppState;
  user: User | null;
  onCollectionClick: () => void;
  onNewBrainstormClick: () => void;
  onStop: () => void;
  onIntervene: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const UserMenu: React.FC<{ user: User; onLogout: () => void; onProfileClick: () => void; }> = ({ user, onLogout, onProfileClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const userInitial = user.email ? user.email.charAt(0).toUpperCase() : '?';

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-[var(--bg-primary)] focus:ring-purple-500"
            >
                {userInitial}
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg py-1 border border-[var(--border-color)] animate-fade-in"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="px-4 py-2 text-xs text-[var(--text-secondary)] border-b border-[var(--border-color)] truncate">{user.email}</div>
                    <button
                        onClick={() => { onProfileClick(); setIsOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--border-color)]"
                    >
                        Profilim
                    </button>
                    <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--border-color)]"
                    >
                        Çıkış Yap
                    </button>
                </div>
            )}
        </div>
    );
}

const Header: React.FC<HeaderProps> = ({ appState, user, onCollectionClick, onNewBrainstormClick, onStop, onIntervene, onLogout, onProfileClick, theme, toggleTheme }) => {
  const isBrainstorming = appState === AppState.BRAINSTORMING;
  
  return (
    <header className="bg-[var(--bg-primary)]/80 backdrop-blur-sm border-b border-[var(--border-color)] sticky top-0 z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Logo />
             <button 
              onClick={onNewBrainstormClick} 
              title="Yeni Fikir Fırtınası Başlat" 
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             {isBrainstorming && (
              <div className="flex items-center gap-2 animate-fade-in">
                <button
                  onClick={onStop}
                  title="Durdur"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  <span className="hidden sm:inline">Durdur</span>
                </button>
                <button
                  onClick={onIntervene}
                  title="Müdahale Et"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.083A9.955 9.955 0 0112 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-1.274 0-2.49-.23-3.622-.638m-3.54-3.54a9.955 9.955 0 01-2.26-3.822 10.012 10.012 0 0115.395 7.425M3 3l18 18" /></svg>
                  <span className="hidden sm:inline">Müdahale Et</span>
                </button>
              </div>
            )}
            <button 
              onClick={toggleTheme} 
              title="Temayı Değiştir" 
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              {theme === 'light' ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24"  stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
            <button 
              onClick={onCollectionClick} 
              title="İnovasyon Panonuz" 
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            {user && <UserMenu user={user} onLogout={onLogout} onProfileClick={onProfileClick} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;