import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ChatBubble, { PersonaIcon } from './components/ChatBubble';
import CollectionModal from './components/CollectionModal';
import IdeaFoundModal from './components/IdeaFoundModal';
import SessionEndModal from './components/SessionEndModal';
import IdeaDetailModal from './components/IdeaDetailModal';
import Toast from './components/Toast';
import ImagePreview from './components/ImagePreview';
import ApiKeyModal from './components/ApiKeyModal';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import { AppState, Message, Persona, SavedIdea, PersonaFocus, Theme, ToastState, IdeaStatus, ExtractedIdea, DetailedIdea, User, Profile } from './types';
import { initializeGeminiClient, generateFullConversationScript, generatePersonaTurn, getRateLimitSummary, summarizeAndExtractIdeas, detailElicitedIdea, generateCerevoResponse, generateTopicImage } from './services/geminiService';
import { BIG_BOSS_REJECTION_TERMS, RATE_LIMIT_DOCUMENTATION } from './constants';
import { PERSONA_DEFINITIONS } from './constants';
import { supabase } from './services/supabaseClient';

const GUEST_QUERY_LIMIT = 3;

const App: React.FC = () => {
  // Auth & User State
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestQueryCount, setGuestQueryCount] = useState(0);

  // Core App State
  const [isGeminiReady, setIsGeminiReady] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [activePersonas, setActivePersonas] = useState<Persona[]>([]);

  // UI State
  const [theme, setTheme] = useState<Theme>('dark');
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [chatBackground, setChatBackground] = useState<string | null>(null);

  // Data State
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
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

  // --- TOASTS ---
  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // --- AUTH & DATA SYNC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (_event === 'SIGNED_OUT') {
        setIsGuest(false);
        setSavedIdeas([]);
        setProfile(null);
        setTheme('dark');
        setMessages([]);
        setChatBackground(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (user: User): Promise<Profile | null> => {
    try {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) throw error;
        if (data) {
            setProfile(data);
            setTheme(data.theme || 'dark');
            return data;
        }
    } catch (error: any) {
        console.error("Error fetching profile:", JSON.stringify(error, null, 2));
        addToast(`Kullanıcı profili alınırken hata: ${error.message}`, 'error');
    }
    return null;
  }, [addToast]);
  
  const fetchIdeas = useCallback(async (user: User) => {
    try {
        const { data, error } = await supabase.from('ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        if (data) {
            setSavedIdeas(data as SavedIdea[]);
        }
    } catch (error: any) {
        console.error("Error fetching ideas:", JSON.stringify(error, null, 2));
        addToast(`Kaydedilen fikirler alınırken hata: ${error.message}`, 'error');
    }
  }, [addToast]);

  useEffect(() => {
    if (session?.user) {
      const syncUserData = async () => {
        const profileData = await fetchProfile(session.user);
        if (profileData) {
          await fetchIdeas(session.user);
        }
      };
      syncUserData();
      setIsGuest(false);
    } else {
      setProfile(null);
      setSavedIdeas([]);
    }
  }, [session, fetchProfile, fetchIdeas]);


  useEffect(() => {
    document.documentElement.className = theme;
    if (profile && user && profile.theme !== theme) {
        supabase.from('profiles').update({ theme }).eq('id', user.id).then(({ error }) => {
            if (error) console.error("Error updating theme:", error);
        });
    } else if (isGuest) {
        localStorage.setItem('theme', theme);
    }
  }, [theme, profile, user, isGuest]);

  useEffect(() => {
    vaultContents.current = savedIdeas.length > 0 ? savedIdeas.map(i => i.title).join(', ') : '';
  }, [savedIdeas]);
  
  useEffect(() => {
    const apiKey = sessionStorage.getItem('gemini-api-key');
    if (apiKey) {
      try {
        initializeGeminiClient(apiKey);
        setIsGeminiReady(true);
      } catch (error) {
        console.error("API anahtarı ile başlatma başarısız oldu:", error);
        sessionStorage.removeItem('gemini-api-key');
      }
    }
  }, []);

  // --- UI & SCROLL ---
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasNewMessages(false);
  }, []);

  const handleScroll = useCallback(() => {
      const mainEl = mainContentRef.current;
      if (mainEl) {
          const isAtBottom = mainEl.scrollHeight - mainEl.scrollTop - mainEl.clientHeight < 150;
          if (isAtBottom) setHasNewMessages(false);
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

  // --- CORE LOGIC HANDLERS ---
  const handleApiKeySubmit = (apiKey: string) => {
    try {
      initializeGeminiClient(apiKey);
      sessionStorage.setItem('gemini-api-key', apiKey);
      setIsGeminiReady(true);
      addToast('API Anahtarı başarıyla ayarlandı!', 'success');
    } catch (error) {
      console.error("API anahtarı ile başlatma başarısız oldu:", error);
    }
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
  };

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
        return { id: `msg-bg-${Date.now()}-${index}`, text, sender, timestamp: Date.now() + index };
    });

    setFoundIdea({ id: `idea-${Date.now()}`, title, description, topic: currentTopic, status: 'Havuz (Kasa)', conversation: conversationMessages });
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
        
        const responseText = await generatePersonaTurn(currentHistory, currentPersona, currentTopic, currentSettings.personaFocus, currentSettings.isDeepDive, currentSettings.isBigBossActive, currentSettings.bigBossInfluence);
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
                continue;
             }

             setFoundIdea({ id: `idea-${Date.now()}`, title, description, topic: currentTopic, status: 'Havuz (Kasa)', conversation: currentHistory });
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

  const handleNewBrainstorm = useCallback(async (topic: string, isDeepDive: boolean, personaFocus: PersonaFocus, isConcise: boolean, isFlash: boolean, rememberVault: boolean, isBigBossActive: boolean, bigBossInfluence: number) => {
    if (isGuest && guestQueryCount >= GUEST_QUERY_LIMIT) {
        addToast(`Misafir limiti (${GUEST_QUERY_LIMIT} sorgu) doldu. Devam etmek için lütfen üye olun.`, 'error');
        return;
    }

    if (topic.trim().toLowerCase() === 'hız sınırları koyalım') {
      // This is a special command, let it pass
    } else if(isGuest) {
      setGuestQueryCount(prev => prev + 1);
    }

    setChatBackground(null);
    setCurrentTopic(topic);
    setFoundIdea(null);
    setExtractedIdeas([]);
    const newSettings = { isDeepDive, personaFocus, isConcise, isFlash, isBigBossActive, bigBossInfluence };
    setCurrentSettings(newSettings);
    
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    // Generate background image...
    (async () => {
      try {
        const base64Image = await generateTopicImage(topic);
        if (base64Image) setChatBackground(`data:image/png;base64,${base64Image}`);
      } catch (error: any) {
        addToast('Arka plan görseli oluşturulamadı.', 'error');
      }
    })();

    const active = PERSONA_DEFINITIONS.map(p => p.persona).filter(p => personaFocus[p] !== 'Muted' && p !== Persona.HızSınırlarıUzmanı && p !== Persona.Cerevo);
    const orderedActive = [Persona.Moderator, ...active.filter(p => p !== Persona.Moderator)];
    setActivePersonas([...new Set(orderedActive)]);

    setAppState(AppState.PREPARING_TEAM);
    await new Promise(r => setTimeout(r, 2000));
    if (abortControllerRef.current.signal.aborted) return;

    if (isFlash || isConcise) {
        const script = await generateFullConversationScript(topic, personaFocus, isConcise, isDeepDive, isFlash, isBigBossActive, bigBossInfluence, mainFocusIdea, rememberVault ? vaultContents.current : undefined);
        setMainFocusIdea(undefined);
        await runBackgroundTask(script);
    } else {
        const initialMessage: Message = { id: `msg-${Date.now()}`, text: `Yeni Fikir Fırtınası Başladı: **${topic}**`, sender: Persona.System, timestamp: Date.now() };
        setMainFocusIdea(undefined);
        
        const currentHistory = [...messages, initialMessage];
        const moderatorThinkingId = `msg-moderator-init-${Date.now()}`;
        setMessages([...currentHistory, { id: moderatorThinkingId, text: '', sender: Persona.Moderator, timestamp: Date.now(), isThinking: true }]);
        
        const moderatorResponse = await generatePersonaTurn(currentHistory, Persona.Moderator, topic, personaFocus, isDeepDive, isBigBossActive, bigBossInfluence);
        if (abortControllerRef.current.signal.aborted) { setAppState(AppState.IDLE); return; }

        const moderatorMessage: Message = { id: moderatorThinkingId, text: moderatorResponse, sender: Persona.Moderator, timestamp: Date.now(), isThinking: false };
        const finalHistory = [...currentHistory, moderatorMessage];
        setMessages(finalHistory);
        runConversationLoop(finalHistory, 1);
    }
  }, [isGuest, guestQueryCount, addToast, messages, mainFocusIdea, runBackgroundTask, runConversationLoop]);

  const handleChatMessage = useCallback(async (messageText: string) => {
    const userMessage: Message = { id: `msg-user-${Date.now()}`, text: messageText, sender: Persona.User, timestamp: Date.now() };
    const currentHistory = [...messages, userMessage];
    const thinkingId = `msg-cerevo-think-${Date.now()}`;
    const thinkingMessage: Message = { id: thinkingId, text: '', sender: Persona.Cerevo, timestamp: Date.now(), isThinking: true };
    setMessages([...currentHistory, thinkingMessage]);
    const cerevoResponseText = await generateCerevoResponse(currentHistory);
    const cerevoMessage: Message = { id: thinkingId, text: cerevoResponseText, sender: Persona.Cerevo, timestamp: Date.now(), isThinking: false };
    setMessages(prev => prev.map(m => m.id === thinkingId ? cerevoMessage : m));
  }, [messages]);

  const handleUserInput = useCallback(async (inputText: string) => {
    const sender = currentSettings.isBigBossActive ? Persona.BigBoss : Persona.User;
    const userMessage: Message = { id: `msg-${Date.now()}`, text: inputText, sender: sender, timestamp: Date.now() };
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

    if (isGuest) {
      setSavedIdeas(prev => [foundIdea, ...prev].filter((i): i is SavedIdea => i !== null));
    } else if (session?.user && profile) {
      const { data, error } = await supabase.from('ideas').insert({ ...foundIdea, user_id: session.user.id }).select();
      if (data) setSavedIdeas(prev => [data[0] as SavedIdea, ...prev]);
      if (error) {
        addToast('Fikir kaydedilemedi.', 'error');
        console.error(error);
        return;
      }
      
      // Update points
      const newPoints = (profile.points || 0) + 50;
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', session.user.id)
        .select()
        .single();
      
      if (profileError) {
        addToast('Puan güncellenemedi.', 'error');
        console.error(profileError);
      } else if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } else {
      addToast('Fikri kaydetmek için giriş yapmalısınız.', 'error');
      return;
    }
    
    addToast('Fikir inovasyon panosuna eklendi!', 'success');
    setFoundIdea(null);
    setAppState(AppState.IDLE);
    setMessages([]);
    setChatBackground(null);
  }, [foundIdea, addToast, session, profile, isGuest]);

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

  const handleDetailIdea = async (idea: ExtractedIdea) => {
    setExtractedIdeas([]);
    setAppState(AppState.DETAILING_IDEA);
    const sysMessage: Message = { id: `msg-sys-${Date.now()}`, text: `Fikir detaylandırılıyor: **${idea.title}**`, sender: Persona.System, timestamp: Date.now() };
    setMessages(prev => [...prev, sysMessage]);
    const details = await detailElicitedIdea(messages, idea);
    const newDetailedIdea: DetailedIdea = { id: idea.id, title: idea.title, details: details, topic: currentTopic, conversation: messages };
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
    const newSavedIdea: SavedIdea = { id: ideaToSave.id, title: ideaToSave.title, description: ideaToSave.details, topic: ideaToSave.topic, status: 'Havuz (Kasa)', conversation: ideaToSave.conversation };
    if (session?.user) {
        const { data, error } = await supabase.from('ideas').insert({ ...newSavedIdea, user_id: session.user.id }).select();
        if (data) setSavedIdeas(prev => [data[0] as SavedIdea, ...prev]);
        if (error) { addToast('Fikir kaydedilemedi.', 'error'); console.error(error); }
    } else {
        setSavedIdeas(prev => [newSavedIdea, ...prev]); // Guest
    }
    addToast(`"${ideaToSave.title}" inovasyon panosuna eklendi!`, 'success');
    setDetailedIdea(null);
  };
  
  const handleIdeaStatusChange = async (ideaId: string, newStatus: IdeaStatus) => {
      setSavedIdeas(prev => prev.map(idea => idea.id === ideaId ? { ...idea, status: newStatus } : idea));
      if (session?.user) {
          const { error } = await supabase.from('ideas').update({ status: newStatus }).eq('id', ideaId).eq('user_id', session.user.id);
          if (error) {
              addToast('Fikir durumu güncellenemedi.', 'error');
              fetchIdeas(session.user); // Revert on error
          }
      }
  };
  
  const handleProfileUpdate = (updatedProfile: Partial<Profile>) => {
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
  }

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const handleSetMainFocus = (idea: SavedIdea) => {
    setMainFocusIdea(`Başlık: ${idea.title}\nAçıklama: ${idea.description}`);
    addToast(`"${idea.title}" ana odak olarak ayarlandı!`, 'success');
    setIsCollectionOpen(false);
  };

  // --- RENDER LOGIC ---
  if (!session && !isGuest) {
    return <AuthModal onSuccess={() => {}} onGuest={() => setIsGuest(true)} />;
  }

  if (!isGeminiReady) {
    return <ApiKeyModal onApiKeySubmit={handleApiKeySubmit} />;
  }
  
  const isChatMode = appState === AppState.IDLE && messages.length > 0;

  return (
    <div 
      className={`app-container bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-all duration-500 ${chatBackground ? 'chat-with-bg' : ''}`}
      style={{ backgroundImage: chatBackground ? `url(${chatBackground})` : 'none' }}
    >
      <div className="relative z-10 flex flex-col h-screen">
        <Header 
          appState={appState}
          user={user}
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
          onLogout={handleLogout}
          onProfileClick={() => setIsProfileModalOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
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
                    <h1 className="text-3xl font-bold font-light-heading">Merhaba, ben Cerevo!</h1>
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
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
      <CollectionModal isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} savedIdeas={savedIdeas} onLoadIdea={() => {}} onSetMainFocus={handleSetMainFocus} onIdeaStatusChange={handleIdeaStatusChange} />
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />

      <div className="fixed top-5 right-5 z-[100] space-y-2">
        {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />)}
      </div>
    </div>
  );
};

export default App;