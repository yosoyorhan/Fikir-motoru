import React from 'react';
import { AppState, Theme } from '../types';
import Logo from './Logo';

interface HeaderProps {
  appState: AppState;
  onCollectionClick: () => void;
  onNewBrainstormClick: () => void;
  onStop: () => void;
  onIntervene: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ appState, onCollectionClick, onNewBrainstormClick, onStop, onIntervene, theme, toggleTheme }) => {
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">Durdur</span>
                </button>
                <button
                  onClick={onIntervene}
                  title="Müdahale Et"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>
            <button 
              onClick={onCollectionClick} 
              title="İnovasyon Panonuz" 
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0112 6v1.878m-6 0c.235.083.487.128.75.128h10.5c.263 0 .515-.045.75-.128m-6 0V11.25a2.25 2.25 0 002.25 2.25h1.5A2.25 2.25 0 0018 11.25V6.878m-6 0v3.375m-3.75 3.375h10.5a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25h-1.5A2.25 2.25 0 0112 18.75v-1.875m-3.75 0h1.5a2.25 2.25 0 012.25 2.25V18.75m-3.75 0v-1.875a2.25 2.25 0 00-2.25-2.25h-1.5A2.25 2.25 0 003 11.25v1.5a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;