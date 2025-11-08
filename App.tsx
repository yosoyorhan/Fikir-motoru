import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ChatBubble, { PersonaIcon } from './components/ChatBubble';
import CollectionModal from './components/CollectionModal';
import IdeaFoundModal from './components/IdeaFoundModal';
import SessionEndModal from './components/SessionEndModal';
import IdeaDetailModal from './components/IdeaDetailModal';
import Toast from './components/Toast';
import ImagePreview from './components/ImagePreview';
import { AppState, Message, Persona, SavedIdea, PersonaFocus, GameData, Theme, ToastState, IdeaStatus, ExtractedIdea, DetailedIdea, Profile } from './types';
import { initializeGeminiClient, generateFullConversationScript, generatePersonaTurn, getRateLimitSummary, summarizeAndExtractIdeas, detailElicitedIdea, generateCerevoResponse, generateTopicImage } from './services/geminiService';
import { BIG_BOSS_REJECTION_TERMS, RATE_LIMIT_DOCUMENTATION } from './constants';
import { API_KEY } from './config';
import { PERSONA_DEFINITIONS } from './constants';
import { auth, db } from './services/supabaseService';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  // Core App State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [activePersonas, setActivePersonas] = useState<Persona[]>([]);

  // UI State
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [chatBackground, setChatBackground] = useState<string | null>(null);

  // Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);


  // Data State
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    const saved = localStorage.getItem('savedIdeas');
    return saved ? JSON.parse(saved) : [];
  });
  const [gameData, setGameData] = useState<GameData>(() => {
    const saved = localStorage.getItem('gameData');
    return saved ? JSON.parse(saved) : { points: 100, level: 'Başlangıç' };
  });
  const [foundIdea, setFoundIdea] = useState<SavedIdea | null>(null);
  const [extractedIdeas, setExtractedIdeas] = useState<ExtractedIdea[]>([]);
  const [detailedIdea, setDetailedIdea] = useState<DetailedIdea | null>(null);

  const [mainFocusIdea, setMainFocusIdea] = useState<string | undefined>();
  const vaultContents = useRef<string>('');
  
  const [currentSettings, setCurrentSettings] = useState<{
    isDeepDive: boolean;
    personaFocus: PersonaFocus;
    isConcise: boolean;
    isFlash: boolean;
    isBigBossActive: boolean;
    bigBossInfluence: number;
  }>({
    isDeepDive: false,
    personaFocus: {},
    isConcise: false,
    isFlash: false,
    isBigBossActive: false,
    bigBossInfluence: 30,
  });


  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Supabase'den gelen yanıtı önce 'authListener' gibi bir değişkene atıyoruz.
    // Bu, TypeScript'in 'data' özelliğini daha doğru tanımasına yardımcı olur.
    const authListener = auth.onAuthStateChange((_event, session) => {
      setSession(session);

      if (session) {
        // Kullanıcı varsa verilerini çek
        fetchUserData(session.user.id);
      } else {
        // Kullanıcı yoksa (çıkış yapmışsa), misafir verilerini localStorage'dan yükle
        const localIdeas = localStorage.getItem('savedIdeas');
        setSavedIdeas(localIdeas ? JSON.parse(localIdeas) : []);

        const localGameData = localStorage.getItem('gameData');
        setGameData(localGameData ? JSON.parse(localGameData) : { points: 100, level: 'Başlangıç' });

        setProfile(null);
      }

      setIsAuthModalOpen(false); // Başarılı işlemden sonra modalı kapat
      setLoading(false);
    });

    // Cleanup fonksiyonu
    return () => {
      // ?. operatörü ile güvenli bir şekilde unsubscribe oluyoruz
      authListener.data.subscription.unsubscribe();
    };
  // Bağımlılık dizisi boş, sadece mount/unmount anında çalışacak
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const [profileData, ideas, gameData] = await Promise.all([
        db.getProfile(userId),
        db.getSavedIdeas(userId),
        db.getGameData(userId)
      ]);
      setProfile(profileData);
      setSavedIdeas(ideas);
      if (gameData) setGameData(gameData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      addToast('Kullanıcı verileri alınırken bir hata oluştu.', 'error');
    }
  };

  useEffect(() => {
    if (!session) {
        localStorage.setItem('savedIdeas', JSON.stringify(savedIdeas));
    }
    vaultContents.current = savedIdeas.map(i => i.title).join(', ');
  }, [savedIdeas, session]);

  const { points, level } = gameData;
  useEffect(() => {
    if (session) {
      db.updateGameData({ points, level }, session.user.id);
    } else {
      localStorage.setItem('gameData', JSON.stringify({ points, level }));
    }
  }, [points, level, session]);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
  }, []);

  const handleScroll = useCallback(() => {
      const mainEl = mainContentRef.current;
      if (mainEl) {
          // If user scrolls close to the bottom, hide the notification
          const isAtBottom = mainEl.scrollHeight - mainEl.scrollTop - mainEl.clientHeight < 150;
          if (isAtBottom) {
              setHasNewMessages(false);
          }
      }
  }, []);
  
  useEffect(() => {
      const mainEl = mainContentRef.current;
      if (!mainEl || messages.length === 0) return;
  
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return;
  
      const isFromUser = lastMessage.sender === Persona.User || lastMessage.sender === Persona.BigBoss || lastMessage.sender === Persona.Cerevo;
      
      const prevScrollHeight = prevScrollHeightRef.current ?? 0;
      const isScrolledToBottomBeforeUpdate = prevScrollHeight - mainEl.scrollTop - mainEl.clientHeight < 150;
  
      if (isFromUser || isScrolledToBottomBeforeUpdate) {
          scrollToBottom();
      } else {
          setHasNewMessages(true);
      }
      
      prevScrollHeightRef.current = mainEl.scrollHeight;
  
  }, [messages, scrollToBottom]);

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto remove toast after 5 seconds for cleanliness
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const runBackgroundTask = useCallback(async (script: string) => {
    setAppState(AppState.LOADING);
    
    const hasFoundIdea = script.includes('[FİKİR BULDUM]');
    if (!hasFoundIdea) {
      addToast('Ekip bir sonuca varamadı, lütfen tekrar deneyin.', 'error');
      setAppState(AppState.IDLE);
      return;
    }

    const parts = script.split('[FİKİR BULDUM]');
    const conversationScript = parts[0];
    const ideaContent = parts[1];
    
    const ideaLines = ideaContent.trim().split('\n').filter(Boolean);
    const title = ideaLines.shift()?.replace(/Başlık:\s*/, '') || '';
    
    if (!title || title.trim().toLowerCase() === 'başlıksız fikir') {
        addToast('Yeterince niş bir fikir bulunamadı. Lütfen konuyu değiştirerek tekrar deneyin.', 'error');
        setAppState(AppState.IDLE);
        return;
    }
      
    const description = ideaLines.join('\n').replace(/Açıklama:\s*/, '');

    const conversationLines = conversationScript.trim().split('\n').filter(line => line.includes(':'));
    const conversationMessages: Message[] = conversationLines.map((line, index) => {
        const lineParts = line.split(':');
        const sender = lineParts.shift()?.trim() as Persona;
        const text = lineParts.join(':').trim();
        return {
            id: `msg-bg-${Date.now()}-${index}`,
            text,
            sender,
            timestamp: Date.now() + index,
        };
    });

    setFoundIdea({
        id: `idea-${Date.now()}`,
        title,
        description,
        topic: currentTopic,
        status: 'Havuz (Kasa)',
        conversation: conversationMessages,
    });
    setAppState(AppState.FINALIZING);
  }, [addToast, currentTopic]);

  const runConversationLoop = useCallback(async (initialHistory: Message[], startTurn = 0) => {
    setAppState(AppState.BRAINSTORMING);
    let currentHistory = [...initialHistory];
    
    const maxTurns = activePersonas.length * 3;
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    for (let turn = startTurn; turn < maxTurns; turn++) {
        if (signal.aborted) break;

        const currentPersona = activePersonas[turn % activePersonas.length];
        if (currentSettings.personaFocus[currentPersona] === 'Muted') continue;

        const thinkingId = `msg-${Date.now()}`;
        setMessages(prev => [...prev, { id: thinkingId, text: '', sender: currentPersona, timestamp: Date.now(), isThinking: true }]);
        
        const responseText = await generatePersonaTurn(
            currentHistory,
            currentPersona,
            currentTopic,
            currentSettings.personaFocus,
            currentSettings.isDeepDive,
            currentSettings.isBigBossActive,
            currentSettings.bigBossInfluence
        );

        if (signal.aborted) break;

        const newMessage: Message = { id: thinkingId, text: responseText, sender: currentPersona, timestamp: Date.now(), isThinking: false };
        setMessages(prev => prev.map(m => m.id === thinkingId ? newMessage : m));
        currentHistory.push(newMessage);
        
        const upperResponse = responseText.toUpperCase();
        if (upperResponse.includes('SANIRIM BİR FİKİR BULDUM!') || upperResponse.includes('[FİKİR BULDUM]')) {
             const ideaContent = responseText.substring(upperResponse.lastIndexOf('BULDUM!') + 7).trim();
             const ideaLines = ideaContent.trim().split('\n').filter(Boolean);
             const title = ideaLines.find(l => l.toLowerCase().startsWith('başlık:'))?.replace(/Başlık:\s*/i, '') || 'Başlıksız Fikir';
             const description = ideaLines.filter(l => !l.toLowerCase().startsWith('başlık:')).join('\n').replace(/Açıklama:\s*/i, '').trim();

             if (!title || title.trim().toLowerCase() === 'başlıksız fikir') {
                addToast('Yeterince niş bir fikir bulunamadı, ekip devam ediyor...', 'error');
                continue; // Continue brainstorming
             }

             setFoundIdea({
                id: `idea-${Date.now()}`,
                title,
                description,
                topic: currentTopic,
                status: 'Havuz (Kasa)',
                conversation: currentHistory,
              });
              setAppState(AppState.FINALIZING);
              return;
        }

        if (responseText.includes('[AWAITING_BOSS_INPUT]')) {
            setAppState(AppState.AWAITING_USER_INPUT);
            return;
        }
    }

    if (!signal.aborted) {
        setAppState(AppState.LOADING);
        addToast('Fikir fırtınası tamamlandı. Potansiyel fikirler özetleniyor...', 'success');
        const ideas = await summarizeAndExtractIdeas(currentHistory);
        setExtractedIdeas(ideas);
        setAppState(AppState.SESSION_ENDED);
    }
  }, [activePersonas, currentTopic, currentSettings, addToast]);
  
  const handleRateLimitRequest = async () => {
    setAppState(AppState.PREPARING_TEAM);
    setMessages([{ 
        id: `msg-sys-${Date.now()}`, 
        text: "Hız Sınırları Uzmanı'na bağlanılıyor...", 
        sender: Persona.System, 
        timestamp: Date.now() 
    }]);

    await new Promise(r => setTimeout(r, 1500));
    
    const thinkingId = `msg-think-${Date.now()}`;
    setMessages(prev => [...prev, { 
        id: thinkingId, 
        text: '', 
        sender: Persona.HızSınırlarıUzmanı, 
        timestamp: Date.now(), 
        isThinking: true 
    }]);
    setAppState(AppState.BRAINSTORMING);

    const summary = await getRateLimitSummary(RATE_LIMIT_DOCUMENTATION);
    
    const summaryMessage: Message = {
      id: thinkingId,
      text: summary,
      sender: Persona.HızSınırlarıUzmanı,
      timestamp: Date.now(),
      isThinking: false
    };

    setMessages(prev => prev.map(m => m.id === thinkingId ? summaryMessage : m));
    setAppState(AppState.IDLE);
  };


  const handleNewBrainstorm = useCallback(async (topic: string, isDeepDive: boolean, personaFocus: PersonaFocus, isConcise: boolean, isFlash: boolean, rememberVault: boolean, isBigBossActive: boolean, bigBossInfluence: number) => {
    if (topic.trim().toLowerCase() === 'hız sınırları koyalım') {
      handleRateLimitRequest();
      return;
    }
    
    setChatBackground(null);
    setCurrentTopic(topic);
    setFoundIdea(null);
    setExtractedIdeas([]);
    const newSettings = { isDeepDive, personaFocus, isConcise, isFlash, isBigBossActive, bigBossInfluence };
    setCurrentSettings(newSettings);
    
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Generate background image, but don't wait for it
    (async () => {
      try {
        const base64Image = await generateTopicImage(topic);
        if (base64Image) {
          setChatBackground(`data:image/png;base64,${base64Image}`);
        }
      } catch (error: any) {
        const errorMessage = error.toString();
        // Check for rate limit / quota exceeded error
        if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota')) {
            addToast('Görsel üretme limiti aşıldı. Fikir fırtınası devam ediyor.', 'error');
        } else {
            addToast('Arka plan görseli oluşturulamadı.', 'error');
        }
      }
    })();

    const active = PERSONA_DEFINITIONS
        .map(p => p.persona)
        .filter(p => personaFocus[p] !== 'Muted' && p !== Persona.HızSınırlarıUzmanı && p !== Persona.Cerevo);
    const orderedActive = [Persona.Moderator, ...active.filter(p => p !== Persona.Moderator)];
    setActivePersonas([...new Set(orderedActive)]);

    setAppState(AppState.PREPARING_TEAM);
    await new Promise(r => setTimeout(r, 2000));

    if (abortControllerRef.current.signal.aborted) return;

    if (isFlash || isConcise) {
        const script = await generateFullConversationScript(
          topic, personaFocus, isConcise, isDeepDive, isFlash, isBigBossActive, bigBossInfluence,
          mainFocusIdea, rememberVault ? vaultContents.current : undefined
        );
        setMainFocusIdea(undefined);
        await runBackgroundTask(script);
    } else {
        const initialMessage: Message = { id: `msg-${Date.now()}`, text: `Yeni Fikir Fırtınası Başladı: **${topic}**`, sender: Persona.System, timestamp: Date.now() };
        setMainFocusIdea(undefined);
        
        const currentHistory = [...messages, initialMessage];

        const moderatorThinkingId = `msg-moderator-init-${Date.now()}`;
        setMessages([
            ...currentHistory,
            { id: moderatorThinkingId, text: '', sender: Persona.Moderator, timestamp: Date.now(), isThinking: true }
        ]);
        
        const moderatorResponse = await generatePersonaTurn(
            currentHistory, Persona.Moderator, topic, personaFocus, isDeepDive, isBigBossActive, bigBossInfluence
        );

        if (abortControllerRef.current.signal.aborted) { setAppState(AppState.IDLE); return; }

        const moderatorMessage: Message = { id: moderatorThinkingId, text: moderatorResponse, sender: Persona.Moderator, timestamp: Date.now(), isThinking: false };
        const finalHistory = [...currentHistory, moderatorMessage];
        setMessages(finalHistory);
        
        runConversationLoop(finalHistory, 1);
    }
  }, [runBackgroundTask, runConversationLoop, mainFocusIdea, messages, addToast]);

  const handleChatMessage = useCallback(async (messageText: string) => {
    const userMessage: Message = {
        id: `msg-user-${Date.now()}`,
        text: messageText,
        sender: Persona.User,
        timestamp: Date.now()
    };
    const currentHistory = [...messages, userMessage];
    
    const thinkingId = `msg-cerevo-think-${Date.now()}`;
    const thinkingMessage: Message = {
        id: thinkingId,
        text: '',
        sender: Persona.Cerevo,
        timestamp: Date.now(),
        isThinking: true
    };
    
    setMessages([...currentHistory, thinkingMessage]);

    const cerevoResponseText = await generateCerevoResponse(currentHistory);

    const cerevoMessage: Message = {
        id: thinkingId,
        text: cerevoResponseText,
        sender: Persona.Cerevo,
        timestamp: Date.now(),
        isThinking: false
    };

    setMessages(prev => prev.map(m => m.id === thinkingId ? cerevoMessage : m));

  }, [messages]);

  const handleUserInput = useCallback(async (inputText: string) => {
    const sender = currentSettings.isBigBossActive ? Persona.BigBoss : Persona.User;
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: inputText,
      sender: sender,
      timestamp: Date.now(),
    };
    
    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    
    const isRejection = sender === Persona.BigBoss && BIG_BOSS_REJECTION_TERMS.some(term => inputText.toLowerCase().includes(term));
    if (isRejection) addToast('Big Boss fikri beğenmedi, ekip yeni bir yön arıyor.', 'error');

    runConversationLoop(currentHistory);
  }, [messages, runConversationLoop, addToast, currentSettings.isBigBossActive]);
  
  const handleStop = useCallback(() => {
      abortControllerRef.current?.abort();
      setAppState(AppState.IDLE);
      setChatBackground(null);
      addToast('Beyin fırtınası durduruldu.', 'error');
  }, [addToast]);

  const handleIntervene = useCallback(() => {
      abortControllerRef.current?.abort();
      setAppState(AppState.AWAITING_USER_INPUT);
      addToast('Sohbete müdahale ediyorsunuz...', 'success');
  }, [addToast]);

  const handleAcceptIdea = useCallback(async () => {
    if (!foundIdea) return;
    if (!session) {
        setIsAuthModalOpen(true);
        addToast('Fikirleri kaydetmek için giriş yapmalısınız.', 'error');
        return;
    }

    try {
        const newIdea = await db.addSavedIdea(foundIdea, session.user.id);
        setSavedIdeas(prev => [newIdea, ...prev]);
    } catch (error) {
        console.error("Error saving idea:", error);
        addToast('Fikir kaydedilirken bir hata oluştu.', 'error');
        return;
    }

    setGameData(prev => ({ ...prev, points: prev.points + 50 }));
    addToast('Fikir inovasyon panosuna eklendi!', 'success');
    setFoundIdea(null);
    setAppState(AppState.IDLE);
    setMessages([]);
    setChatBackground(null);
  }, [foundIdea, addToast, session]);

  const handleRejectIdea = useCallback(async () => {
    if (!foundIdea) return;
    addToast('Ekip beyin fırtınasına devam ediyor...', 'success');
    
    const history = foundIdea.conversation;
    const userMessage: Message = { id: `msg-${Date.now()}`, text: "Bu fikri beğenmedim, devam edelim.", sender: Persona.User, timestamp: Date.now() };
    const newHistory = [...history, userMessage];
    
    setMessages(newHistory);
    setFoundIdea(null);

    runConversationLoop(newHistory);
  }, [foundIdea, runConversationLoop, addToast]);

  // Handlers for SessionEndModal
  const handleDetailIdea = async (idea: ExtractedIdea) => {
    setExtractedIdeas([]);
    setAppState(AppState.DETAILING_IDEA);
    const sysMessage: Message = { id: `msg-sys-${Date.now()}`, text: `Fikir detaylandırılıyor: **${idea.title}**`, sender: Persona.System, timestamp: Date.now() };
    setMessages(prev => [...prev, sysMessage]);

    const details = await detailElicitedIdea(messages, idea);

    const newDetailedIdea: DetailedIdea = {
        id: idea.id,
        title: idea.title,
        details: details,
        topic: currentTopic,
        conversation: messages,
    };
    setDetailedIdea(newDetailedIdea);
    setAppState(AppState.IDLE);
  };

  const handleContinueBrainstorming = () => {
    const userMessage: Message = { id: `msg-sys-${Date.now()}`, text: "Kullanıcı beyin fırtınasına devam edilmesini istedi.", sender: Persona.System, timestamp: Date.now() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setExtractedIdeas([]);
    runConversationLoop(newHistory);
  };

  const handleEndSession = () => {
    setAppState(AppState.IDLE);
    setMessages([]);
    setExtractedIdeas([]);
    setChatBackground(null);
    addToast("Oturum sonlandırıldı.", "success");
  };

  const handleSaveDetailedIdea = async (ideaToSave: DetailedIdea) => {
    if (!session) {
        setIsAuthModalOpen(true);
        addToast('Fikirleri kaydetmek için giriş yapmalısınız.', 'error');
        return;
    }

    const newSavedIdea: SavedIdea = {
        id: ideaToSave.id,
        title: ideaToSave.title,
        description: ideaToSave.details,
        topic: ideaToSave.topic,
        status: 'Havuz (Kasa)',
        conversation: ideaToSave.conversation,
    };

    try {
        const savedIdea = await db.addSavedIdea(newSavedIdea, session.user.id);
        setSavedIdeas(prev => [savedIdea, ...prev.filter(i => i.id !== savedIdea.id)]);
    } catch (error) {
        console.error("Error saving detailed idea:", error);
        addToast('Detaylı fikir kaydedilirken bir hata oluştu.', 'error');
        return;
    }

    addToast(`"${ideaToSave.title}" inovasyon panosuna eklendi!`, 'success');
    setDetailedIdea(null);
  };

  const isChatMode = appState === AppState.IDLE && messages.length > 0;

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  const handleSetMainFocus = (idea: SavedIdea) => {
    setMainFocusIdea(`Başlık: ${idea.title}\nAçıklama: ${idea.description}`);
    addToast(`"${idea.title}" ana odak olarak ayarlandı!`, 'success');
    setIsCollectionOpen(false);
  };
  const handleIdeaStatusChange = async (ideaId: string, newStatus: IdeaStatus) => {
      if (session) {
          try {
              const updatedIdea = await db.updateIdeaStatus(ideaId, newStatus, session.user.id);
              setSavedIdeas(prev => prev.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
          } catch (error) {
              console.error("Error updating idea status:", error);
              addToast('Fikir durumu güncellenirken bir hata oluştu.', 'error');
          }
      } else {
        setSavedIdeas(prev => prev.map(idea => idea.id === ideaId.toString() ? { ...idea, status: newStatus } : idea));
      }
  };

  return (
    <div 
      className={`app-container bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-all duration-500 ${chatBackground ? 'chat-with-bg' : ''}`}
      style={{ backgroundImage: chatBackground ? `url(${chatBackground})` : 'none' }}
    >
      <div className="background-animation"></div>
      <div className="relative z-10 flex flex-col h-screen">
        <Header 
          appState={appState}
          onCollectionClick={() => setIsCollectionOpen(true)}
          onNewBrainstormClick={() => {
            handleStop();
            setMessages([]);
            setFoundIdea(null);
            setExtractedIdeas([]);
            setChatBackground(null);
          }}
          onStop={handleStop}
          onIntervene={handleIntervene}
          theme={theme}
          toggleTheme={toggleTheme}
          session={session}
          onLoginClick={() => setIsAuthModalOpen(true)}
          onProfileClick={() => setIsProfileModalOpen(true)}
        />
        <main ref={mainContentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 flex flex-col">
          <div className="container mx-auto max-w-3xl flex-1">
            {appState === AppState.IDLE && messages.length === 0 && (
                <div className="text-center py-20 animate-fade-in flex flex-col items-center justify-center">
                    <div className="flex justify-center mb-4">
                      <img
                        id="welcome-logo"
                        src="https://psikominik.com/test/9980be65-439b-4908-a7b3-3c026ff24729_removalai_preview.png"
                        alt="Cerevo Logo"
                        className="w-24 h-24 animate-pulse-icon"
                      />
                    </div>
                    <h1 className="text-3xl font-bold font-light-heading gradient-title">Merhaba, ben Cerevo!</h1>
                    <p className="text-[var(--text-secondary)] mt-2">
                        Sohbet edebilir veya bir konu girip "Fikir Bul" butonuna basarak<br/>beyin fırtınası başlatabilirsin.
                    </p>
                </div>
            )}
            {appState === AppState.PREPARING_TEAM && (
              <div className="text-center py-20 animate-fade-in flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                      {activePersonas.map((persona, index) => (
                          <div key={persona} className="animate-pulse-persona" style={{ animationDelay: `${index * 150}ms` }}>
                              <PersonaIcon persona={persona} className="bg-[var(--bg-secondary)]" />
                          </div>
                      ))}
                  </div>
                  <p className="mt-4 text-[var(--text-secondary)]">Ekip Toplanıyor...</p>
              </div>
            )}
            {appState === AppState.DETAILING_IDEA && (
              <div className="text-center py-20 animate-fade-in flex flex-col items-center justify-center flex-1">
                <div className="animate-pulse-icon mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="mt-4 text-[var(--text-primary)] text-lg font-semibold">Fikir Detaylandırılıyor</p>
                <p className="mt-1 text-[var(--text-secondary)]">Lütfen bekleyin, uzmanlar konsepti geliştiriyor...</p>
              </div>
            )}
            {(appState === AppState.LOADING || (appState === AppState.SESSION_ENDED && extractedIdeas.length === 0)) && (
              <div className="text-center py-20 animate-fade-in flex flex-col items-center justify-center flex-1">
                {currentSettings.isFlash ? (
                  <>
                    <div className="glitch" data-text="FİKİR ÜRETİLİYOR">FİKİR ÜRETİLİYOR</div>
                    <p className="mt-4 text-[var(--text-secondary)]">Yüksek hızda düşünülüyor...</p>
                  </>
                ) : (
                  <>
                    <div className="animate-pulse-icon mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--bg-secondary)]">
                        <PersonaIcon persona={Persona.System} />
                    </div>
                    <p className="mt-4 text-[var(--text-secondary)]">
                      {appState === AppState.LOADING ? 'Ekip arka planda çalışıyor...' : 'Fikirler özetleniyor...'}
                    </p>
                  </>
                )}
              </div>
            )}
            {messages.map(msg => <ChatBubble key={msg.id} message={msg} isChatMode={isChatMode} />)}
            <div ref={chatEndRef} />
          </div>
        </main>
        
        {hasNewMessages && (
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
                <button
                    onClick={scrollToBottom}
                    className="py-2 px-5 rounded-full bg-blue-500 text-white font-semibold shadow-lg text-sm animate-fade-in hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    Yeni Mesajlar
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>
        )}

        <InputForm 
          onFindIdea={handleNewBrainstorm} 
          onChatMessage={handleChatMessage}
          onUserInput={handleUserInput} 
          appState={appState} 
          isBigBossActiveInSession={currentSettings.isBigBossActive}
        />
      </div>
      
      {chatBackground && <ImagePreview imageUrl={chatBackground} />}

      <IdeaFoundModal isOpen={!!foundIdea} idea={foundIdea} onAccept={handleAcceptIdea} onReject={handleRejectIdea} />
      <SessionEndModal 
        isOpen={appState === AppState.SESSION_ENDED && extractedIdeas.length > 0}
        ideas={extractedIdeas}
        onDetail={handleDetailIdea}
        onContinue={handleContinueBrainstorming}
        onEnd={handleEndSession}
      />
      <IdeaDetailModal 
        isOpen={!!detailedIdea}
        idea={detailedIdea}
        onSave={handleSaveDetailedIdea}
        onClose={() => setDetailedIdea(null)}
      />
      <CollectionModal
        isOpen={isCollectionOpen}
        onClose={() => setIsCollectionOpen(false)}
        savedIdeas={savedIdeas}
        onLoadIdea={() => {}}
        onSetMainFocus={handleSetMainFocus}
        onIdeaStatusChange={handleIdeaStatusChange}
        session={session}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {session && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          session={session}
          profile={profile}
          onProfileUpdate={setProfile}
        />
      )}

      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />)}
      </div>
    </div>
  );
};

export default App;
