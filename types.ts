
export enum AppView {
  DASHBOARD = 'dashboard',
  CHAT = 'chat',
  MEDIA_GEN = 'media_gen',
  VOICE_LIVE = 'voice_live',
  ANALYSIS = 'analysis',
  SETTINGS = 'settings'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingMetadata?: any;
  thinking?: string;
  images?: string[];
  videoUrl?: string;
}

export interface MediaState {
  isGenerating: boolean;
  progressMessage: string;
  error?: string;
}
