import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { Persona, Dominance, PersonaFocus, AppState } from '../types';
import { PersonaIcon } from './ChatBubble';
import { generateInspirationTopics } from '../services/geminiService';

interface InputFormProps {
  onSubmit: (topicA: string, topicB: string, isDeepDive: boolean, personaFocus: PersonaFocus, isConcise: boolean, isFlash: boolean, rememberVault: boolean, isBigBossActive: boolean, bigBossInfluence: number) => void;
  onUserInput: (inputText: string) => void;
  appState: AppState;
  isBigBossActiveInSession: boolean;
}

const focusablePersonas: Persona[] = [Persona.FikirBabası, Persona.Developer, Persona.MarketResearcher, Persona.UserPersona, Persona.FinansalAnalist];

const InputForm: React.FC<InputFormProps> = ({ onSubmit, onUserInput, appState, isBigBossActiveInSession }) => {
  const isLoading = appState === AppState.BRAINSTORMING || appState === AppState.LOADING || appState === AppState.PREPARING_TEAM;
  
  // Input state
  const [topicA, setTopicA] = useState('');
  const [topicB, setTopicB] = useState('');
  const [userInput, setUserInput] = useState('');
  
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
  
  // Inspiration Topics
  const [staticInspirationTopics] = useState(['Eğitim Teknolojileri', 'Sürdürülebilir Yaşam', 'Akıllı Ev Cihazları']);
  const [aiTopics, setAiTopics] = useState<string[]>([]);
  const [isFetchingTopics, setIsFetchingTopics] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  const fetchTopics = useCallback(async () => {
    if (isFetchingTopics) return;
    setIsFetchingTopics(true);
    try {
        const topics = await generateInspirationTopics();
        setAiTopics(topics);
    } catch (error) {
        console.error("Failed to fetch topics:", error);
    } finally {
        setIsFetchingTopics(false);
    }
  }, [isFetchingTopics]);
  
  const startTopicRotation = useCallback(() => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
        if (!isHoveringRef.current && document.visibilityState === 'visible') {
            fetchTopics();
        }
    }, 7000); // 7 saniyede bir değiştir
  }, [fetchTopics]);
  
  useEffect(() => {
    fetchTopics();
    startTopicRotation();
    return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };
  }, [fetchTopics, startTopicRotation]);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicA.trim() && !isLoading) {
      onSubmit(topicA, topicB, isDeepDive, personaFocus, isConciseMode, isFlashMode, rememberVault, isBigBossActive, bigBossInfluence);
      setTopicA('');
      setTopicB('');
    }
  };

  const handleUserInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
        onUserInput(userInput);
        setUserInput('');
    }
  }

  const handleTopicClick = (topic: string) => {
      if (!topicA) setTopicA(topic);
      else if (!topicB) setTopicB(topic);
  }

  const handlePersonaFocusChange = (persona: Persona, dominance: Dominance) => {
    setPersonaFocus(prev => ({...prev, [persona]: dominance}));
  }

  const renderSettingsModal = () => {
    if (!isSettingsOpen) return null;
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center animate-fade-in"
        onClick={() => setIsSettingsOpen(false)}
      >
        <div 
          className="modal-card w-full max-w-md p-6 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
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
    );
  }

  if (appState === AppState.AWAITING_USER_INPUT) {
    return (
       <div className="p-4 bg-[var(--bg-secondary)]/80 backdrop-blur-sm border-t border-[var(--border-color)] w-full sticky bottom-0">
         <div className="container mx-auto max-w-3xl">
            <form onSubmit={handleUserInputSubmit}>
              <div className="relative">
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={isBigBossActiveInSession ? "Big Boss olarak yanıt verin..." : "Sohbete müdahale edin..."}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg p-3 pr-20 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
                <button type="submit" disabled={!userInput.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-500 text-white rounded-lg flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
              </div>
            </form>
         </div>
       </div>
    )
  }

  if (appState !== AppState.IDLE) {
      return null; // Hide form during active brainstorming
  }

  return (
    <div className="p-4 w-full">
      <div className="container mx-auto max-w-3xl relative">
        <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <div 
              className="flex items-center justify-center gap-2 flex-wrap min-h-[36px]"
              onMouseEnter={() => { isHoveringRef.current = true; }}
              onMouseLeave={() => { isHoveringRef.current = false; }}
            >
                {isFetchingTopics && aiTopics.length === 0 ? (
                    <div className="text-sm text-[var(--text-secondary)]">İlham verici konular yükleniyor...</div>
                ) : (
                    <div key={aiTopics.join()} className="flex items-center justify-center gap-2 flex-wrap animate-fade-in">
                        {aiTopics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => handleTopicClick(topic)}
                                className="bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-secondary)] hover:border-blue-500/50 hover:bg-blue-500/5 px-4 py-2 rounded-full transition-colors"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="flex justify-center gap-2 mb-4">
            {staticInspirationTopics.map(topic => (
                <button 
                key={topic}
                onClick={() => handleTopicClick(topic)}
                className="bg-[var(--chat-bubble-user-bg)] text-sm text-[var(--text-secondary)] hover:bg-[var(--border-color)] px-4 py-2 rounded-full transition-colors"
                >
                {topic}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} >
            <div className="relative flex items-center w-full bg-[var(--chat-bubble-ai-bg)] rounded-2xl shadow-md border border-[var(--border-color)] p-2">
                <input 
                    value={topicA}
                    onChange={(e) => setTopicA(e.target.value)}
                    placeholder="Konu A (örn: Veterinerlik)"
                    className="flex-1 bg-transparent p-2 text-[var(--text-primary)] focus:outline-none placeholder:text-gray-400"
                />
                <span className="text-gray-400 text-2xl font-light mx-2">+</span>
                <input 
                    value={topicB}
                    onChange={(e) => setTopicB(e.target.value)}
                    placeholder="Konu B (isteğe bağlı)"
                    className="flex-1 bg-transparent p-2 text-[var(--text-primary)] focus:outline-none placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={!topicA.trim()}
                    className="flex-shrink-0 h-12 w-12 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
            </div>

          <div className="flex items-center justify-center gap-x-6 gap-y-3 mt-4 flex-wrap">
              <div className="flex items-center">
                  <input type="checkbox" id="conciseMode" checked={isConciseMode} onChange={(e) => setIsConciseMode(e.target.checked)} disabled={isFlashMode || isDeepDive} className="h-4 w-4 rounded bg-transparent border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-600 disabled:opacity-50" />
                  <label htmlFor="conciseMode" className={`ml-2 text-sm text-[var(--text-secondary)] ${isFlashMode || isDeepDive ? 'opacity-50' : ''}`}>Kısa Mod</label>
              </div>
              <div className="flex items-center">
                  <input type="checkbox" id="flashMode" checked={isFlashMode} onChange={(e) => setIsFlashMode(e.target.checked)} className="h-4 w-4 rounded bg-transparent border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-600" />
                  <label htmlFor="flashMode" className="ml-2 text-sm text-[var(--text-secondary)]">Flash Yanıt</label>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(o => !o)}
                className={`flex items-center gap-2 text-sm p-2 rounded-lg border-2 transition-colors ${isSettingsOpen ? 'gradient-strategy-button text-white' : 'text-[var(--text-secondary)] hover:text-blue-500 border-transparent'}`}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                Strateji
              </button>
          </div>
        </form>
        {renderSettingsModal()}
      </div>
    </div>
  );
};

export default InputForm;