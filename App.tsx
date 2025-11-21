
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Search, Library, Settings, 
  Play, Pause, SkipForward, SkipBack, Heart, Plus, 
  Volume2, ListMusic, Trash2, MoreVertical, X,
  RotateCcw, RotateCw, Loader2, Globe, Music2, LogOut, User as UserIcon, Lock, ArrowRight
} from 'lucide-react';
import { TRANSLATIONS, INITIAL_QUERIES, BG_PRESETS } from './constants';
import { Song, User, AppSettings, ViewState, Language, Playlist, UserData } from './types';

// --- HOOKS ---

const useAudioPlayer = (volume: number) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 30);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = (src: string) => {
    if (!audioRef.current) return;
    if (currentSrc !== src) {
      audioRef.current.src = src;
      setCurrentSrc(src);
      audioRef.current.load();
    }
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(e => console.error("Playback error", e));
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  return { 
    audioRef, isPlaying, progress, duration, 
    playTrack, togglePlay, seek, skip, setIsPlaying 
  };
};

// --- AUTH COMPONENT ---

const AuthScreen = ({ onLogin, onGuest }: { onLogin: (u: User) => void, onGuest: () => void }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lang, setLang] = useState<Language>('az');

  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError(t.auth.error_empty);
      return;
    }

    const storedUsersStr = localStorage.getItem('616_users');
    const storedUsers = storedUsersStr ? JSON.parse(storedUsersStr) : {};

    if (mode === 'register') {
      if (storedUsers[username]) {
        setError(t.auth.error_exists);
        return;
      }
      // Register new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
      };
      // Save credentials (simulated)
      storedUsers[username] = { ...newUser, password }; // In real app, hash password
      localStorage.setItem('616_users', JSON.stringify(storedUsers));
      onLogin(newUser);
    } else {
      // Login
      const userRecord = storedUsers[username];
      if (!userRecord) {
        setError(t.auth.error_not_found);
        return;
      }
      if (userRecord.password !== password) {
        setError(t.auth.error_password);
        return;
      }
      const { password: _, ...safeUser } = userRecord;
      onLogin(safeUser as User);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg-gradient"></div>
      <div className="auth-orb" style={{ top: '-20%', left: '-10%', width: '50%', height: '50%', background: 'rgba(57,255,20,0.1)' }}></div>
      <div className="auth-orb" style={{ bottom: '-20%', right: '-10%', width: '50%', height: '50%', background: 'rgba(57,255,20,0.05)' }}></div>

      <div className="auth-card">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div className="flex justify-center items-center gap-2 text-primary animate-glow" style={{ marginBottom: '0.5rem' }}>
            <Music2 size={48} />
            <span className="font-mono" style={{ fontSize: '2.5rem', fontWeight: 900 }}>616</span>
          </div>
          <p className="text-muted" style={{ fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.auth.subtitle}</p>
        </div>

        {/* Language Switcher Mini */}
        <div className="absolute" style={{ top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          {['az', 'en', 'tr', 'ru'].map((l) => (
            <button 
              key={l} 
              onClick={() => setLang(l as Language)} 
              className="font-bold"
              style={{ 
                background: 'none', border: 'none', textTransform: 'uppercase', fontSize: '0.75rem', cursor: 'pointer',
                color: lang === l ? 'var(--primary)' : '#666' 
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <h2 className="font-bold text-center" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white' }}>
          {mode === 'register' ? t.auth.register_title : t.auth.login_title}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <UserIcon className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={20} />
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.auth.username}
              className="auth-input"
            />
          </div>
          <div className="auth-input-group">
            <Lock className="absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={20} />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.password}
              className="auth-input"
            />
          </div>

          {error && <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

          <button type="submit" className="btn-primary" style={{ marginBottom: '1.5rem' }}>
            {mode === 'register' ? t.auth.register : t.auth.login} <ArrowRight size={18}/>
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#999', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1rem' }}
          >
            {mode === 'register' ? t.auth.have_account : t.auth.no_account}
          </button>

          <div className="flex items-center gap-4" style={{ marginBottom: '1rem' }}>
            <div style={{ height: '1px', flex: 1, background: '#333' }}></div>
            <span style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Or</span>
            <div style={{ height: '1px', flex: 1, background: '#333' }}></div>
          </div>

          <button onClick={onGuest} className="btn-outline">
            {t.auth.guest_continue}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  // -- STATE --
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [view, setView] = useState<ViewState>('home');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  
  // Data
  const [library, setLibrary] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [homeSongs, setHomeSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false); 
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState<Song | null>(null); 

  // Settings
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'deep-neon',
    language: 'az',
    volume: 0.5,
    background: '#050505'
  });

  const t = TRANSLATIONS[settings.language];
  const player = useAudioPlayer(settings.volume);

  // -- AUTH PERSISTENCE --
  useEffect(() => {
    const savedUser = localStorage.getItem('616_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthChecking(false);
  }, []);

  // -- DATA PERSISTENCE (User Scoped) --

  // Load User Data when user changes
  useEffect(() => {
    if (!user) return;

    const dataKey = `616_data_${user.id}`;
    const savedDataStr = localStorage.getItem(dataKey);
    
    if (savedDataStr) {
      const data: UserData = JSON.parse(savedDataStr);
      setLibrary(data.library || []);
      setPlaylists(data.playlists || []);
      if (data.settings) setSettings(data.settings);
    } else {
      setLibrary([]);
      setPlaylists([]);
      setSettings(prev => ({...prev, volume: 0.5})); 
    }
    fetchInitialContent();
  }, [user]);

  // Save User Data on changes
  useEffect(() => {
    if (!user) return;
    const data: UserData = {
      userId: user.id,
      library,
      playlists,
      settings
    };
    localStorage.setItem(`616_data_${user.id}`, JSON.stringify(data));
  }, [library, playlists, settings, user]);

  // -- LOGIC --

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.id !== 'guest') {
      localStorage.setItem('616_active_user', JSON.stringify(u));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('616_active_user');
    setUser(null);
    setView('home');
    player.setIsPlaying(false);
    if (player.audioRef.current) player.audioRef.current.pause();
  };

  const fetchInitialContent = async () => {
    setIsLoading(true);
    try {
      const randomQuery = INITIAL_QUERIES[Math.floor(Math.random() * INITIAL_QUERIES.length)];
      await performSearch(randomQuery, true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query: string, isHomeUpdate = false) => {
    if (!query.trim()) return;
    if (!isHomeUpdate) setIsLoading(true);
    
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=40`);
      const data = await res.json();
      
      const songs: Song[] = data.results.map((item: any) => ({
        id: item.trackId.toString(),
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName,
        coverUrl: item.artworkUrl100.replace('100x100', '600x600'),
        audioUrl: item.previewUrl,
        duration: item.trackTimeMillis / 1000
      }));

      if (isHomeUpdate) {
        setHomeSongs(songs);
      } else {
        setSearchResults(songs);
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    player.playTrack(song.audioUrl);
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPl: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      createdAt: Date.now(),
      songs: []
    };
    setPlaylists([...playlists, newPl]);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
  };

  const deletePlaylist = (id: string) => {
    if (window.confirm("Are you sure?")) {
      setPlaylists(playlists.filter(p => p.id !== id));
      if (activePlaylist?.id === id) {
        setActivePlaylist(null);
        setView('playlists');
      }
    }
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.id === song.id)) return p;
        return { ...p, songs: [...p.songs, song] };
      }
      return p;
    }));
    setShowAddToPlaylistModal(null);
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    const updatedPlaylists = playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) };
      }
      return p;
    });
    setPlaylists(updatedPlaylists);
    if (activePlaylist && activePlaylist.id === playlistId) {
       const updatedActive = updatedPlaylists.find(p => p.id === playlistId) || null;
       setActivePlaylist(updatedActive);
    }
  };

  const toggleLibrary = (song: Song) => {
    const exists = library.some(s => s.id === song.id);
    if (exists) {
      setLibrary(library.filter(s => s.id !== song.id));
    } else {
      setLibrary([...library, song]);
    }
  };

  useEffect(() => {
    const handleNext = () => {
      let list: Song[] = homeSongs;
      if (view === 'search') list = searchResults;
      if (view === 'library') list = library;
      if (view === 'playlist-details' && activePlaylist) list = activePlaylist.songs;

      if (currentSong && list.length > 0) {
        const idx = list.findIndex(s => s.id === currentSong.id);
        if (idx >= 0 && idx < list.length - 1) {
          playSong(list[idx + 1]);
        }
      }
    };

    if (!player.isPlaying && player.progress >= player.duration && player.duration > 0) {
       handleNext();
    }
  }, [player.isPlaying, player.progress, currentSong, view, activePlaylist, library, searchResults, homeSongs]);


  if (isAuthChecking) return <div className="app-container justify-center items-center" style={{background: '#050505'}}><Loader2 className="animate-spin text-primary" size={48}/></div>;

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onGuest={() => handleLogin({ id: 'guest', username: 'Guest', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest' })} />;
  }

  // -- RENDER APP --

  // Theme class handling
  const themeClass = settings.theme === 'light-neon' ? 'light-theme' : 'dark-theme';
  const bgStyle = settings.background.startsWith('#') ? { backgroundColor: settings.background } : { backgroundImage: settings.background };

  const SongItem = ({ song, displayMode = 'card' }: { song: Song, displayMode?: 'card' | 'row' }) => {
    const isPlayingThis = currentSong?.id === song.id;
    const inLib = library.some(s => s.id === song.id);

    if (displayMode === 'row') {
      return (
        <div className={`list-row ${isPlayingThis ? 'active' : ''}`}>
          <div onClick={() => playSong(song)} className="relative cursor-pointer" style={{ width: '48px', height: '48px', marginRight: '1rem', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={song.coverUrl} alt="art" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlayingThis ? 0.5 : 1 }} />
            {isPlayingThis && <div className="absolute" style={{ inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }} className="animate-glow"/></div>}
          </div>
          <div className="flex-col" style={{ flex: 1, overflow: 'hidden', marginRight: '1rem', cursor: 'pointer' }} onClick={() => playSong(song)}>
             <h4 className="truncate font-bold" style={{ color: isPlayingThis ? 'var(--primary)' : 'var(--text-main)', fontSize: '0.9rem' }}>{song.title}</h4>
             <p className="truncate text-muted" style={{ fontSize: '0.75rem' }}>{song.artist}</p>
          </div>
          <div className="row-actions">
             <button onClick={() => toggleLibrary(song)} className="icon-btn" style={{ color: inLib ? 'var(--primary)' : 'inherit' }}>
                <Heart size={18} fill={inLib ? "currentColor" : "none"} />
             </button>
             <button onClick={() => setShowAddToPlaylistModal(song)} className="icon-btn">
                <ListMusic size={18} />
             </button>
             {view === 'playlist-details' && activePlaylist && (
               <button onClick={() => removeSongFromPlaylist(activePlaylist.id, song.id)} className="icon-btn" style={{ color: '#ef4444' }}>
                  <Trash2 size={18} />
               </button>
             )}
          </div>
        </div>
      );
    }

    return (
      <div className="card group">
        <div onClick={() => playSong(song)} className="card-image-container cursor-pointer">
          <img src={song.coverUrl} alt={song.title} className="card-image" />
          <button className="play-overlay-btn">
             <Play size={20} fill="black" style={{marginLeft: '2px'}} />
          </button>
        </div>
        <h3 className="font-bold truncate" style={{ marginBottom: '0.25rem' }}>{song.title}</h3>
        <p className="text-muted truncate" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{song.artist}</p>
        <div className="flex justify-between items-center">
           <button onClick={() => toggleLibrary(song)} className="icon-btn" style={{ padding: 0, color: inLib ? 'var(--primary)' : 'inherit' }}>
              <Heart size={20} fill={inLib ? "currentColor" : "none"} />
           </button>
           <button onClick={() => setShowAddToPlaylistModal(song)} className="icon-btn" style={{ padding: 0 }}>
              <Plus size={20} />
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container ${themeClass}`} style={bgStyle}>
      
      {/* SIDEBAR */}
      <aside className="sidebar">
         <div className="flex items-center gap-3 text-primary" style={{ marginBottom: '2.5rem' }}>
            <Music2 size={32} />
            <span className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900 }}>616</span>
         </div>
         <nav style={{ flex: 1 }}>
            {[
              { id: 'home', icon: Home, label: t.nav.home },
              { id: 'search', icon: Search, label: t.nav.search },
              { id: 'library', icon: Library, label: t.nav.library },
              { id: 'playlists', icon: ListMusic, label: t.nav.playlists },
              { id: 'settings', icon: Settings, label: t.nav.settings },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`nav-btn ${view === item.id || (item.id === 'playlists' && view === 'playlist-details') ? 'active' : ''}`}
              >
                <item.icon size={20} style={{ marginRight: '0.75rem' }} />
                {item.label}
              </button>
            ))}
         </nav>
         <div className="user-badge">
            <img src={user.avatarUrl} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--primary)' }} />
            <div style={{ overflow: 'hidden' }}>
               <p className="font-bold truncate" style={{ fontSize: '0.875rem' }}>{user.username}</p>
               <p className="text-primary truncate" style={{ fontSize: '0.75rem' }}>{user.id === 'guest' ? 'Guest' : 'Premium'}</p>
            </div>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* Mobile Header */}
        <div className="mobile-header">
           <span className="font-mono text-primary" style={{ fontSize: '1.5rem', fontWeight: 900 }}>616</span>
           <button onClick={() => setView('settings')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Settings /></button>
        </div>

        <div className="view-scroll-area">
           
           {/* VIEW: HOME */}
           {view === 'home' && (
             <div className="view-container">
                <header style={{ marginBottom: '2rem' }}>
                   <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t.auth.welcome}, {user.username}</h1>
                   <p className="text-muted">{t.home.top_hits}</p>
                </header>
                
                {isLoading ? (
                  <div className="flex justify-center" style={{ padding: '5rem 0' }}><Loader2 className="animate-spin text-primary" size={40}/></div>
                ) : (
                  <div className="song-grid">
                    {homeSongs.map(song => (
                      <SongItem key={song.id} song={song} />
                    ))}
                  </div>
                )}
             </div>
           )}

           {/* VIEW: SEARCH */}
           {view === 'search' && (
             <div className="view-container">
                <div className="search-header">
                   <div className="search-input-wrapper">
                      <Search className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
                        placeholder={t.search.placeholder}
                        className="search-input"
                      />
                      {isLoading && <Loader2 className="absolute animate-spin text-primary" style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />}
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                   {searchResults.length > 0 ? (
                     searchResults.map(song => (
                       <SongItem key={song.id} song={song} displayMode="row" />
                     ))
                   ) : (
                     <div className="text-center text-muted" style={{ padding: '5rem 0' }}>
                        <p>{searchQuery ? t.search.no_results : 'Type to search Apple Music...'}</p>
                     </div>
                   )}
                </div>
             </div>
           )}

           {/* VIEW: LIBRARY */}
           {view === 'library' && (
             <div className="view-container">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Heart className="text-primary" fill="currentColor"/> {t.library.favorites}</h2>
                {library.length === 0 ? (
                  <div className="text-center text-muted" style={{ padding: '5rem 0' }}>{t.library.empty}</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {library.map(song => (
                      <SongItem key={song.id} song={song} displayMode="row" />
                    ))}
                  </div>
                )}
             </div>
           )}

           {/* VIEW: PLAYLISTS */}
           {view === 'playlists' && (
             <div className="view-container">
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                   <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t.playlists.title}</h2>
                   <button 
                     onClick={() => setShowPlaylistModal(true)}
                     className="bg-primary"
                     style={{ color: '#000', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '999px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                   >
                     <Plus size={18} /> {t.playlists.create}
                   </button>
                </div>

                {playlists.length === 0 ? (
                  <div className="text-center text-muted" style={{ padding: '5rem 0' }}>{t.playlists.empty}</div>
                ) : (
                  <div className="playlist-grid">
                    {playlists.map(pl => (
                      <div 
                        key={pl.id} 
                        onClick={() => { setActivePlaylist(pl); setView('playlist-details'); }}
                        className="card group cursor-pointer"
                      >
                        <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#1f2937', borderRadius: '0.5rem', marginBottom: '0.75rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           {pl.songs.length > 0 ? (
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%', height: '100%' }}>
                               {pl.songs.slice(0,4).map(s => <img key={s.id} src={s.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>)}
                             </div>
                           ) : (
                             <ListMusic size={40} className="text-muted" />
                           )}
                           <div className="absolute group-hover:opacity-100" style={{ inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Play size={30} style={{ color: 'white', fill: 'white' }} />
                           </div>
                        </div>
                        <h3 className="font-bold truncate">{pl.name}</h3>
                        <p className="text-muted" style={{ fontSize: '0.75rem' }}>{pl.songs.length} songs</p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           )}

           {/* VIEW: PLAYLIST DETAILS */}
           {view === 'playlist-details' && activePlaylist && (
             <div className="view-container">
                <div className="flex flex-col md:flex-row gap-6" style={{ marginBottom: '2rem', alignItems: 'flex-end' }}>
                   <div style={{ width: '200px', height: '200px', backgroundColor: '#1f2937', borderRadius: '0.75rem', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', flexShrink: 0, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                      {activePlaylist.songs.slice(0,4).map(s => <img key={s.id} src={s.coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>)}
                   </div>
                   <div style={{ flex: 1 }}>
                      <p className="text-primary" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Playlist</p>
                      <h1 style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '1rem' }}>{activePlaylist.name}</h1>
                      <div className="flex items-center gap-4">
                         <button onClick={() => { if(activePlaylist.songs.length) playSong(activePlaylist.songs[0]); }} className="play-fab">
                           <Play fill="black" style={{ marginLeft: '2px' }} />
                         </button>
                         <button onClick={() => deletePlaylist(activePlaylist.id)} className="icon-btn" style={{ color: '#ef4444' }}>
                           <Trash2 />
                         </button>
                      </div>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                   {activePlaylist.songs.length === 0 ? (
                     <div className="text-muted" style={{ padding: '2.5rem 0' }}>This playlist is empty. Search for songs to add them!</div>
                   ) : (
                     activePlaylist.songs.map((song, idx) => (
                       <div key={idx + song.id} className="list-row">
                          <span className="text-muted" style={{ width: '2rem', textAlign: 'center', fontFamily: 'monospace', fontSize: '0.875rem' }}>{idx + 1}</span>
                          <div style={{ flex: 1 }}>
                            <SongItem song={song} displayMode="row" />
                          </div>
                       </div>
                     ))
                   )}
                </div>
                
                <button onClick={() => setView('playlists')} className="text-muted" style={{ marginTop: '2rem', fontSize: '0.875rem', cursor: 'pointer', background: 'none', border: 'none' }}>&larr; Back to Playlists</button>
             </div>
           )}

           {/* VIEW: SETTINGS */}
           {view === 'settings' && (
             <div className="view-container" style={{ maxWidth: '800px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>{t.settings.title}</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <section className="card">
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Globe size={18} className="text-primary"/> {t.settings.language}</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                         {['az', 'en', 'tr', 'ru'].map(lang => (
                           <button 
                             key={lang} 
                             onClick={() => setSettings({...settings, language: lang as Language})}
                             style={{ 
                               padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer',
                               backgroundColor: settings.language === lang ? 'var(--primary)' : 'rgba(128,128,128,0.1)',
                               color: settings.language === lang ? '#000' : 'inherit'
                             }}
                           >
                             {lang}
                           </button>
                         ))}
                      </div>
                   </section>

                   <section className="card">
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Loader2 size={18} className="text-primary"/> {t.settings.theme}</h3>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                          <button 
                             onClick={() => setSettings({...settings, theme: 'deep-neon', background: '#050505'})} 
                             style={{ 
                               flex: 1, padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
                               border: settings.theme === 'deep-neon' ? '2px solid var(--primary)' : '2px solid transparent',
                               backgroundColor: '#050505', color: 'white'
                             }}
                          >
                             Deep Neon
                          </button>
                          <button 
                             onClick={() => setSettings({...settings, theme: 'light-neon', background: '#f3f4f6'})} 
                             style={{ 
                               flex: 1, padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
                               border: settings.theme === 'light-neon' ? '2px solid var(--primary)' : '2px solid transparent',
                               backgroundColor: '#ffffff', color: 'black'
                             }}
                          >
                             Light Neon
                          </button>
                      </div>
                   </section>

                   <section className="card">
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon size={18} className="text-primary"/> Account</h3>
                      <div className="justify-between items-center flex">
                         <div className="flex items-center gap-3">
                            <img src={user.avatarUrl} style={{ width: '3rem', height: '3rem', borderRadius: '50%' }} alt="user"/>
                            <div>
                               <p className="font-bold">{user.username}</p>
                               <p className="text-muted" style={{ fontSize: '0.75rem' }}>ID: {user.id}</p>
                            </div>
                         </div>
                         <button 
                           onClick={handleLogout} 
                           style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                         >
                            <LogOut size={16}/> {t.settings.logout}
                         </button>
                      </div>
                   </section>

                   <div className="text-center text-muted" style={{ fontSize: '0.75rem', paddingTop: '2.5rem' }}>
                      Version 6.1.6 • Powered by iTunes API
                   </div>
                </div>
             </div>
           )}

        </div>

        {/* --- MODALS --- */}
        
        {/* CREATE PLAYLIST MODAL */}
        {showPlaylistModal && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 50, backdropFilter: 'blur(4px)' }}>
             <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--modal-bg)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>{t.playlists.create_title}</h3>
                <input 
                  autoFocus
                  value={newPlaylistName} 
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder={t.playlists.name_placeholder}
                  className="search-input"
                  style={{ marginBottom: '1.5rem', borderRadius: '0.5rem' }}
                />
                <div className="flex justify-end gap-3">
                   <button onClick={() => setShowPlaylistModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancel</button>
                   <button onClick={createPlaylist} style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: 'var(--primary)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>{t.playlists.create_btn}</button>
                </div>
             </div>
          </div>
        )}

        {/* ADD TO PLAYLIST MODAL */}
        {showAddToPlaylistModal && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 50, backdropFilter: 'blur(4px)' }}>
             <div className="card" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--modal-bg)' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                   <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{t.player.add_to_pl}</h3>
                   <button onClick={() => setShowAddToPlaylistModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                
                <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   {playlists.length === 0 && <p className="text-muted text-center" style={{ padding: '1rem' }}>{t.playlists.empty}</p>}
                   {playlists.map(pl => (
                     <button 
                       key={pl.id}
                       onClick={() => addSongToPlaylist(pl.id, showAddToPlaylistModal)}
                       className="list-row"
                       style={{ width: '100%', border: 'none', cursor: 'pointer', color: 'inherit', textAlign: 'left' }}
                     >
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(128,128,128,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.75rem' }}><ListMusic size={20} className="text-muted"/></div>
                        <div>
                           <p className="font-bold">{pl.name}</p>
                           <p className="text-muted" style={{ fontSize: '0.75rem' }}>{pl.songs.length} songs</p>
                        </div>
                     </button>
                   ))}
                </div>
                
                <button 
                   onClick={() => { setShowAddToPlaylistModal(null); setShowPlaylistModal(true); }}
                   style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer' }}
                >
                   + {t.playlists.create}
                </button>
             </div>
          </div>
        )}

        {/* FIXED PLAYER PANEL */}
        <div className="player-panel">
           {/* Progress Bar */}
           <div 
             className="progress-bar-container"
             onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                player.seek(percent * player.duration);
             }}
           >
              <div className="progress-fill" style={{ width: `${(player.progress / (player.duration || 1)) * 100}%` }} />
              <div className="progress-thumb" style={{ left: `${(player.progress / (player.duration || 1)) * 100}%`, opacity: 1 }} />
           </div>

           <div className="player-controls-row">
              {/* Song Info */}
              <div className="flex items-center gap-3" style={{ width: '30%', overflow: 'hidden' }}>
                 {currentSong ? (
                   <>
                     <img src={currentSong.coverUrl} style={{ width: '48px', height: '48px', borderRadius: '4px', border: '1px solid #333' }} className={player.isPlaying ? 'animate-spin-slow' : ''} alt="Art" />
                     <div style={{ minWidth: 0 }}>
                        <h4 className="truncate font-bold" style={{ fontSize: '0.875rem' }}>{currentSong.title}</h4>
                        <p className="text-muted truncate" style={{ fontSize: '0.75rem' }}>{currentSong.artist}</p>
                     </div>
                   </>
                 ) : (
                   <div className="flex items-center gap-3 opacity-50">
                       <div style={{ width: '48px', height: '48px', backgroundColor: '#333', borderRadius: '4px' }} className="animate-pulse" />
                       <div className="flex-col gap-2">
                          <div style={{ width: '80px', height: '12px', backgroundColor: '#333', marginBottom: '4px', borderRadius: '2px' }} className="animate-pulse"/>
                          <div style={{ width: '48px', height: '8px', backgroundColor: '#333', borderRadius: '2px' }} className="animate-pulse"/>
                       </div>
                   </div>
                 )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6" style={{ flex: 1 }}>
                 <button onClick={() => player.skip(-10)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} className="hover:text-primary"><RotateCcw size={20} /></button>
                 <button onClick={player.togglePlay} className="play-fab">
                   {player.isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" style={{ marginLeft: '2px' }} />}
                 </button>
                 <button onClick={() => player.skip(10)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} className="hover:text-primary"><RotateCw size={20} /></button>
              </div>

              {/* Volume */}
              <div className="vol-control flex justify-end items-center gap-3" style={{ width: '30%' }}>
                 <Volume2 size={18} className="text-muted" />
                 <input 
                   type="range" min="0" max="1" step="0.01" 
                   value={settings.volume} 
                   onChange={(e) => setSettings({...settings, volume: parseFloat(e.target.value)})} 
                   style={{ width: '80px' }}
                 />
              </div>
           </div>
        </div>

        {/* MOBILE NAV */}
        <div className="mobile-nav">
           {[ { id: 'home', icon: Home }, { id: 'search', icon: Search }, { id: 'library', icon: Library }, { id: 'playlists', icon: ListMusic } ].map(item => (
             <button 
                key={item.id} 
                onClick={() => setView(item.id as ViewState)} 
                style={{ 
                   padding: '0.5rem', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer',
                   color: view === item.id ? 'var(--primary)' : 'var(--text-muted)',
                   backgroundColor: view === item.id ? 'var(--primary-dim)' : 'transparent'
                }}
             >
                <item.icon size={24} />
             </button>
           ))}
        </div>
      </main>
    </div>
  );
}
