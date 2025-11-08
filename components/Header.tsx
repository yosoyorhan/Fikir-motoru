import React, { useState } from 'react';
import { AppState, Theme } from '../types';
import Logo from './Logo';
import Icon from './Icon';
import { PlusCircle, StopCircle, Eye, Moon, Sun, Archive, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { auth } from '../services/supabaseService';

interface HeaderProps {
  appState: AppState;
  onCollectionClick: () => void;
  onNewBrainstormClick: () => void;
  onStop: () => void;
  onIntervene: () => void;
  theme: Theme;
  toggleTheme: () => void;
  session: Session | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  appState,
  onCollectionClick,
  onNewBrainstormClick,
  onStop,
  onIntervene,
  theme,
  toggleTheme,
  session,
  onLoginClick,
  onProfileClick
}) => {
  const isBrainstorming = appState === AppState.BRAINSTORMING;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    setIsMenuOpen(false);
  };
  
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
              <Icon icon={PlusCircle} size={24} strokeWidth={2} />
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
                  <Icon icon={StopCircle} size={20} className="text-white" />
                  <span className="hidden sm:inline">Durdur</span>
                </button>
                <button
                  onClick={onIntervene}
                  title="Müdahale Et"
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-full text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <Icon icon={Eye} size={20} className="text-white" />
                  <span className="hidden sm:inline">Müdahale Et</span>
                </button>
              </div>
            )}
            <button
              onClick={toggleTheme}
              title="Temayı Değiştir"
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <Icon icon={theme === 'light' ? Moon : Sun} size={24} strokeWidth={2} />
            </button>
            <button
              onClick={onCollectionClick}
              title="İnovasyon Panonuz"
              className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
            >
              <Icon icon={Archive} size={24} strokeWidth={2} />
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                >
                  <Icon icon={UserIcon} size={24} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-secondary)] rounded-lg shadow-lg py-1 animate-fade-in-fast">
                    <div className="px-4 py-2 text-sm text-[var(--text-secondary)] truncate">
                      {session.user.email}
                    </div>
                    <button
                      onClick={() => {
                        onProfileClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                    >
                      <Icon icon={UserIcon} size={16} />
                      Profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                    >
                      <Icon icon={LogOut} size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                title="Giriş Yap"
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-full text-white bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] hover:opacity-90 transition-opacity"
              >
                <Icon icon={LogIn} size={20} className="text-white" />
                <span className="hidden sm:inline">Giriş Yap</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
