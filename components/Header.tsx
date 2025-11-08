import React from 'react';
import { AppState, Theme } from '../types';
import Logo from './Logo';
import Icon from './Icon';

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
              <Icon name="plus-circle" size={24} strokeWidth={2} />
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
                  <Icon name="stop-circle" size={20} className="text-white" />
                  <span className="hidden sm:inline">Durdur</span>
                </button>
                <button
                  onClick={onIntervene}
                  title="Müdahale Et"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <Icon name="eye" size={20} className="text-white" />
                  <span className="hidden sm:inline">Müdahale Et</span>
                </button>
              </div>
            )}
            <button
              onClick={toggleTheme}
              title="Temayı Değiştir"
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={24} strokeWidth={2} />
            </button>
            <button
              onClick={onCollectionClick}
              title="İnovasyon Panonuz"
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <Icon name="archive" size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;