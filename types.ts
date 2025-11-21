export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl: string; // iTunes previewUrl
  duration: number; // In seconds
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  songs: Song[];
}

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export type ThemeType = 'deep-neon' | 'light-neon';
export type Language = 'en' | 'az' | 'tr' | 'ru';

export interface AppSettings {
  theme: ThemeType;
  language: Language;
  volume: number;
  background: string;
}

export interface UserData {
  userId: string;
  library: Song[];
  playlists: Playlist[];
  settings: AppSettings;
}

export type ViewState = 'home' | 'search' | 'library' | 'playlists' | 'playlist-details' | 'settings';