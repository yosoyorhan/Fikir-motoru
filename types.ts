// This file defines the core types and interfaces used throughout the application.

export enum Persona {
  Moderator = 'Moderatör',
  MarketResearcher = 'Pazar Araştırmacısı',
  Developer = 'Geliştirici',
  UserPersona = 'Kullanıcı Personası',
  FinansalAnalist = 'Finansal Analist',
  FikirBabası = 'Fikir Babası',
  BigBoss = 'Big Boss',
  System = 'Sistem',
  User = 'Kullanıcı',
  HızSınırlarıUzmanı = 'Hız Sınırları Uzmanı',
  Cerevo = 'Cerevo',
}

export enum AppState {
  IDLE, // Uygulama başlangıç durumu, yeni bir fırtına bekliyor
  PREPARING_TEAM, // "Ekip Toplanıyor..." karşılama ekranı gösteriliyor
  BRAINSTORMING, // Yapay zeka ekibi aktif olarak tartışıyor
  AWAITING_USER_INPUT, // Sistem kullanıcıdan (örn. Big Boss) bir yanıt bekliyor
  FINALIZING, // Fikir bulunduktan sonraki son aşama
  SESSION_ENDED, // Fikir bulunamadığında özet ve seçeneklerin sunulduğu durum
  LOADING, // Flash modu gibi özel yükleme durumları
  DETAILING_IDEA, // Bir fikir detaylandırılıyor
}

export interface PersonaDefinition {
  persona: Persona;
  description: string;
  systemInstruction: string;
}

export interface Message {
  id: string;
  text: string;
  sender: Persona;
  timestamp: number;
  isThinking?: boolean;
}

export interface GameData {
  points: number;
  level: string;
}

export type Theme = 'light' | 'dark';

export type Dominance = 'Leader' | 'Default' | 'Muted';

export type PersonaFocus = {
  [key in Persona]?: Dominance;
};

export type IdeaStatus = 'Havuz (Kasa)' | 'Değerlendiriliyor' | 'Onaylandı';

export interface SavedIdea {
  id: string;
  title: string;
  description: string;
  topic: string;
  status: IdeaStatus;
  conversation: Message[];
}

export interface ExtractedIdea {
  id: string;
  title: string;
  summary: string;
}

export interface DetailedIdea {
    id: string;
    title: string;
    details: string;
    topic: string;
    conversation: Message[];
}

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error';
}
