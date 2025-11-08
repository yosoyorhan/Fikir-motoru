import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Persona, Dominance, PersonaFocus, AppState } from '../types';
import { PersonaIcon } from './ChatBubble';

interface InputFormProps {
  onFindIdea: (topic: string, isDeepDive: boolean, personaFocus: PersonaFocus, isConcise: boolean, isFlash: boolean, rememberVault: boolean, isBigBossActive: boolean, bigBossInfluence: number) => void;
  onChatMessage: (message: string) => void;
  onUserInput: (inputText: string) => void;
  appState: AppState;
  isBigBossActiveInSession: boolean;
}

const focusablePersonas: Persona[] = [Persona.FikirBabası, Persona.Developer, Persona.MarketResearcher, Persona.UserPersona, Persona.FinansalAnalist];

const InputForm: React.FC<InputFormProps> = ({ onFindIdea, onChatMessage, onUserInput, appState, isBigBossActiveInSession }) => {
  const isLoading = appState === AppState.BRAINSTORMING || appState === AppState.LOADING || appState === AppState.PREPARING_TEAM;
  
  // Input state
  const [inputText, setInputText] = useState('');
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeepDive, setIsDeepDive] = useState(false);
  const [rememberVault, setRememberVault] = useState(true);
  const [personaFocus, setPersonaFocus] = useState<PersonaFocus>(
    focusablePersonas.reduce((acc, p) => ({...acc, [p]: p === Persona.UserPersona ? 'Leader' : 'Default'}), {} as PersonaFocus)
  );
  const [isBigBossActive, setIsBigBossActive] = useState(false);
  const [bigBossInfluence, setBigBossInfluence] = useState(30);

  // Speed State
  const [isConciseMode, setIsConciseMode] = useState(false);
  const [isFlashMode, setIsFlashMode] = useState(false);

  useEffect(() => {
    if (isFlashMode) {
      setIsDeepDive(false);
      setIsConciseMode(true);
      setRememberVault(false);
      setIsBigBossActive(false);
    }
  }, [isFlashMode]);

  useEffect(() => {
    if (isDeepDive) {
      setIsConciseMode(false);
      setRememberVault(true);
    }
  }, [isDeepDive]);

  const handleFindIdea = () => {
    if (inputText.trim() && !isLoading) {
      onFindIdea(inputText, isDeepDive, personaFocus, isConciseMode, isFlashMode, rememberVault, isBigBossActive, bigBossInfluence);
      setInputText('');
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onChatMessage(inputText);
      setInputText('');
    }
  }

  const handleUserInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
        onUserInput(inputText);
        setInputText('');
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Create a synthetic event to pass to the handler
        const syntheticEvent = {
            preventDefault: () => e.preventDefault(),
            // You can add other properties if needed
        } as React.FormEvent;
        if (appState === AppState.AWAITING_USER_INPUT) {
            handleUserInputSubmit(syntheticEvent);
        } else {
            handleChatSubmit(syntheticEvent);
        }
    }
  };


  const handlePersonaFocusChange = (persona: Persona, dominance: Dominance) => {
    setPersonaFocus(prev => ({...prev, [persona]: dominance}));
  }
  
  const placeholderText = appState === AppState.AWAITING_USER_INPUT 
    ? (isBigBossActiveInSession ? "Big Boss olarak yanıt verin..." : "Sohbete müdahale edin...")
    : "Bir konu girin veya sohbete başlayın...";

  if (appState !== AppState.IDLE && appState !== AppState.AWAITING_USER_INPUT) {
      return null; // Hide form during active brainstorming
  }

  return (
    <div className="p-4 bg-[var(--bg-secondary)]/80 backdrop-blur-sm border-t border-[var(--border-color)] w-full sticky bottom-0 z-20">
      <div className="container mx-auto max-w-3xl relative">
          <div 
            className={`absolute bottom-full mb-4 w-full transition-all duration-300 ease-in-out ${isSettingsOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
          >
            <div 
              className="modal-card w-full max-w-3xl p-6 relative max-h-[60vh] overflow-y-auto"
            >
              <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]">&times;</button>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Gelişmiş Strateji</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                      <label htmlFor="deepDive" className={`font-medium text-[var(--text-primary)] ${isFlashMode ? 'opacity-50' : ''}`}>
                        Derin Düşüncelere Dal
                      </label>
                      <p className={`text-sm text-[var(--text-secondary)] ${isFlashMode ? 'opacity-50' : ''}`}>Daha yavaş, daha detaylı analiz</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" id="deepDive" checked={isDeepDive} disabled={isFlashMode} onChange={(e) => setIsDeepDive(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
                 <div className="flex items-center justify-between">
                  <div>
                      <label htmlFor="rememberVault" className={`font-medium text-[var(--text-primary)] ${isFlashMode || isDeepDive ? 'opacity-50' : ''}`}>
                        Fikir Kasasını Hatırla
                      </label>
                      <p className={`text-sm text-[var(--text-secondary)] ${isFlashMode || isDeepDive ? 'opacity-50' : ''}`}>Tekrarları önler</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" id="rememberVault" checked={rememberVault} disabled={isFlashMode || isDeepDive} onChange={(e) => setRememberVault(e.target.checked)} />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
                <h4 className="font-bold text-[var(--text-primary)] mb-4">Ekip Odağı</h4>
                <div className="space-y-5">
                {focusablePersonas.map(p => (
                  <div key={p} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PersonaIcon persona={p} />
                      <span className="text-sm font-medium">{p}</span>
                    </div>
                    <div className="segmented-control">
                      <button type="button" onClick={() => handlePersonaFocusChange(p, 'Leader')} className={personaFocus[p] === 'Leader' ? 'active' : ''}>Lider</button>
                      <button type="button" onClick={() => handlePersonaFocusChange(p, 'Default')} className={personaFocus[p] === 'Default' ? 'active' : ''}>Normal</button>
                      <button type="button" onClick={() => handlePersonaFocusChange(p, 'Muted')} className={personaFocus[p] === 'Muted' ? 'active' : ''}>Sessiz</button>
                    </div>
                  </div>
                ))}
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                    <div>
                        <label htmlFor="bigBossMode" className={`font-medium text-[var(--text-primary)] ${isFlashMode ? 'opacity-50' : 'hover:text-red-500'}`}>
                            Big Boss'u Dahil Et
                        </label>
                        <p className={`text-sm text-[var(--text-secondary)] ${isFlashMode ? 'opacity-50' : ''}`}>Tartışmaya bir karar verici ekler</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" id="bigBossMode" checked={isBigBossActive} onChange={(e) => setIsBigBossActive(e.target.checked)} disabled={isFlashMode} />
                        <span className="slider"></span>
                    </label>
                    </div>
                    {isBigBossActive && !isFlashMode && (
                        <div className="mt-4 pt-4">
                            <label htmlFor="bigBossInfluence" className="block text-sm font-medium text-[var(--text-secondary)]">Etki Seviyesi: {bigBossInfluence}</label>
                            <input
                                id="bigBossInfluence"
                                type="range"
                                min="0"
                                max="100"
                                value={bigBossInfluence}
                                onChange={(e) => setBigBossInfluence(parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}
               </div>
              </div>
            </div>
          </div>
          <form onSubmit={appState === AppState.AWAITING_USER_INPUT ? handleUserInputSubmit : handleChatSubmit}>
              <div className="relative flex items-center w-full bg-[var(--chat-bubble-ai-bg)] rounded-2xl shadow-md border border-[var(--border-color)] p-2 gap-2">
                  <input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholderText}
                      className="flex-1 bg-transparent p-2 text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-secondary)]/70 min-w-0"
                      disabled={isLoading}
                      autoFocus
                  />
                  {appState === AppState.IDLE && (
                    <>
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(o => !o)}
                            title="Strateji Ayarları"
                            className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${isSettingsOpen ? 'bg-blue-500 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)]'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100 4m0-4a2 2 0 110 4m0-4v2m0 4v2m8-12a2 2 0 100 4m0-4a2 2 0 110 4m0 4v2m0-4v2m-8 4a2 2 0 100 4m0-4a2 2 0 110 4m0-4v2m0 4v2" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleFindIdea}
                            disabled={!inputText.trim() || isLoading}
                            className="flex-shrink-0 h-10 px-4 flex items-center justify-center gap-2 rounded-xl text-black font-semibold glass-button disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-7.071 7.07a1.5 1.5 0 01-2.122 0l-7.07-7.071M12 21a9 9 0 110-18 9 9 0 010 18z" />
                            </svg>
                            <span>Fikir Bul</span>
                        </button>
                    </>
                  )}
                  {appState === AppState.AWAITING_USER_INPUT && (
                       <button type="submit" disabled={!inputText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                       </button>
                  )}
              </div>
          </form>
      </div>
    </div>
  );
};

export default InputForm;