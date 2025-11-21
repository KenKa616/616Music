
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] to-[#000000] z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-green/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-neon-green/5 rounded-full blur-[120px] animate-pulse-slow animation-delay-2000"></div>

      <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 w-full max-w-md p-8 rounded-2xl shadow-2xl z-10 relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2 text-neon-green animate-glow">
            <Music2 size={48} />
            <span className="text-4xl font-mono font-black tracking-tighter">616</span>
          </div>
          <p className="text-gray-400 text-sm uppercase tracking-widest">{t.auth.subtitle}</p>
        </div>

        {/* Language Switcher Mini */}
        <div className="absolute top-4 right-4 flex gap-2">
          {['az', 'en', 'tr', 'ru'].map((l) => (
            <button 
              key={l} 
              onClick={() => setLang(l as Language)} 
              className={`text-xs font-bold uppercase px-2 py-1 rounded ${lang === l ? 'text-neon-green bg-white/10' : 'text-gray-600 hover:text-gray-400'}`}
            >
              {l}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {mode === 'register' ? t.auth.register_title : t.auth.login_title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.auth.username}
                className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-neon-green focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.auth.password}
                className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-neon-green focus:outline-none transition-colors"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</div>}

          <button 
            type="submit"
            className="w-full bg-neon-green text-black font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {mode === 'register' ? t.auth.register : t.auth.login} <ArrowRight size={18}/>
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <button 
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            {mode === 'register' ? t.auth.have_account : t.auth.no_account}
          </button>

          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-gray-800"></div>
            <span className="text-gray-600 text-xs uppercase">Or</span>
            <div className="h-[1px] flex-1 bg-gray-800"></div>
          </div>

          <button 
            onClick={onGuest}
            className="w-full border border-gray-700 text-gray-300 font-bold py-3 rounded-xl hover:bg-white/5 transition-all"
          >
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
      // Reset for new/guest user if no data exists
      setLibrary([]);
      setPlaylists([]);
      // Keep default settings or partial settings
      setSettings(prev => ({...prev, volume: 0.5})); 
    }

    // Load home content every time we enter app
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

  // Playlist Management
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


  // -- RENDER AUTH IF NO USER --

  if (isAuthChecking) return <div className="h-screen w-full bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-neon-green" size={48}/></div>;

  if (!user) {
    return <AuthScreen onLogin={handleLogin} onGuest={() => handleLogin({ id: 'guest', username: 'Guest', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest' })} />;
  }

  // -- RENDER APP --

  const bgStyle = settings.background.startsWith('#') ? { backgroundColor: settings.background } : { backgroundImage: settings.background, backgroundSize: 'cover' };
  const isLight = settings.theme === 'light-neon';

  const SongItem = ({ song, displayMode = 'card' }: { song: Song, displayMode?: 'card' | 'row' }) => {
    const isPlayingThis = currentSong?.id === song.id;
    const inLib = library.some(s => s.id === song.id);

    if (displayMode === 'row') {
      return (
        <div className={`group flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors ${isPlayingThis ? 'bg-white/10' : ''} ${isLight ? 'hover:bg-black/10 text-black' : 'text-white'}`}>
          <div onClick={() => playSong(song)} className="relative w-12 h-12 rounded overflow-hidden mr-4 cursor-pointer shrink-0">
            <img src={song.coverUrl} alt="art" className={`w-full h-full object-cover ${isPlayingThis ? 'opacity-50' : ''}`} />
            {isPlayingThis && <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 bg-neon-green rounded-full animate-ping"/></div>}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Play size={20} className="text-white fill-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0 mr-4 cursor-pointer" onClick={() => playSong(song)}>
             <h4 className={`font-bold truncate ${isPlayingThis ? 'text-neon-green' : ''}`}>{song.title}</h4>
             <p className={`text-xs truncate ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{song.artist}</p>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={() => toggleLibrary(song)} className={`p-2 rounded-full hover:bg-white/10 ${inLib ? 'text-neon-green' : (isLight ? 'text-gray-500' : 'text-gray-400')}`}>
                <Heart size={18} fill={inLib ? "currentColor" : "none"} />
             </button>
             <button onClick={() => setShowAddToPlaylistModal(song)} className={`p-2 rounded-full hover:bg-white/10 ${isLight ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-white'}`}>
                <ListMusic size={18} />
             </button>
             {view === 'playlist-details' && activePlaylist && (
               <button onClick={() => removeSongFromPlaylist(activePlaylist.id, song.id)} className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
               </button>
             )}
          </div>
        </div>
      );
    }

    return (
      <div className={`group relative p-4 rounded-xl transition-colors ${isLight ? 'bg-white/60 hover:bg-white/80 text-black shadow-lg' : 'bg-[#121212] hover:bg-[#1a1a1a] text-white'}`}>
        <div onClick={() => playSong(song)} className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 shadow-lg cursor-pointer">
          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <button className="absolute bottom-3 right-3 w-10 h-10 bg-neon-green rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
             <Play size={20} fill="black" className="text-black ml-1" />
          </button>
        </div>
        <h3 className="font-bold truncate mb-1">{song.title}</h3>
        <p className={`text-sm truncate mb-3 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{song.artist}</p>
        <div className="flex items-center justify-between">
           <button onClick={() => toggleLibrary(song)} className={`${inLib ? 'text-neon-green' : (isLight ? 'text-gray-400 hover:text-black' : 'text-gray-500 hover:text-white')}`}>
              <Heart size={20} fill={inLib ? "currentColor" : "none"} />
           </button>
           <button onClick={() => setShowAddToPlaylistModal(song)} className={isLight ? 'text-gray-400 hover:text-black' : 'text-gray-500 hover:text-white'}>
              <Plus size={20} />
           </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-500 ${isLight ? 'text-black selection:bg-neon-green' : 'text-white selection:bg-neon-green selection:text-black'}`} style={bgStyle}>
      
      {/* SIDEBAR */}
      <aside className={`hidden md:flex flex-col w-64 border-r p-6 z-20 backdrop-blur-md ${isLight ? 'bg-white/70 border-gray-200' : 'bg-[#0a0a0a]/80 border-gray-800'}`}>
         <div className="flex items-center gap-3 mb-10 text-neon-green">
            <Music2 size={32} />
            <span className="text-2xl font-mono font-black tracking-tighter">616</span>
         </div>
         <nav className="space-y-2 flex-1">
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
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-medium 
                ${view === item.id || (item.id === 'playlists' && view === 'playlist-details')
                  ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' 
                  : (isLight ? 'text-gray-600 hover:bg-black/5' : 'text-gray-400 hover:bg-white/5 hover:text-white')}`}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </button>
            ))}
         </nav>
         <div className={`flex items-center gap-3 p-3 rounded-xl border mt-auto ${isLight ? 'bg-black/5 border-black/10' : 'bg-white/5 border-white/10'}`}>
            <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full border border-neon-green" />
            <div className="overflow-hidden">
               <p className="font-bold text-sm truncate">{user.username}</p>
               <p className="text-xs text-neon-green">{user.id === 'guest' ? 'Guest Account' : 'Premium'}</p>
            </div>
         </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden backdrop-blur-sm">
        
        {/* Mobile Header */}
        <div className={`md:hidden flex items-center justify-between p-4 border-b z-20 ${isLight ? 'bg-white/80 border-gray-200' : 'bg-black/80 border-gray-800'}`}>
           <span className="text-2xl font-mono font-black text-neon-green">616</span>
           <button onClick={() => setView('settings')}><Settings className={isLight ? "text-gray-600" : "text-gray-400"} /></button>
        </div>

        <div className="flex-1 overflow-y-auto pb-40 scrollbar-thin scrollbar-thumb-gray-700">
           
           {/* VIEW: HOME */}
           {view === 'home' && (
             <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <header className="mb-8">
                   <h1 className="text-3xl font-bold mb-2">{t.auth.welcome}, {user.username}</h1>
                   <p className={isLight ? "text-gray-600" : "text-gray-400"}>{t.home.top_hits}</p>
                </header>
                
                {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-green" size={40}/></div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {homeSongs.map(song => (
                      <SongItem key={song.id} song={song} />
                    ))}
                  </div>
                )}
             </div>
           )}

           {/* VIEW: SEARCH */}
           {view === 'search' && (
             <div className="p-6 md:p-8 max-w-5xl mx-auto">
                <div className={`sticky top-0 z-10 py-4 -mt-4 mb-6 backdrop-blur-xl ${isLight ? 'bg-white/60' : 'bg-[#050505]/60'}`}>
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performSearch(searchQuery)}
                        placeholder={t.search.placeholder}
                        className={`w-full border rounded-full py-3.5 pl-12 pr-12 focus:border-neon-green focus:outline-none transition-colors ${isLight ? 'bg-white border-gray-300 text-black' : 'bg-[#121212] border-gray-700 text-white'}`}
                      />
                      {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-neon-green animate-spin" />}
                   </div>
                </div>

                <div className="space-y-1">
                   {searchResults.length > 0 ? (
                     searchResults.map(song => (
                       <SongItem key={song.id} song={song} displayMode="row" />
                     ))
                   ) : (
                     <div className={`text-center py-20 ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                        <p>{searchQuery ? t.search.no_results : 'Type to search Apple Music...'}</p>
                     </div>
                   )}
                </div>
             </div>
           )}

           {/* VIEW: LIBRARY */}
           {view === 'library' && (
             <div className="p-6 md:p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Heart className="text-neon-green" fill="currentColor"/> {t.library.favorites}</h2>
                {library.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">{t.library.empty}</div>
                ) : (
                  <div className="space-y-1">
                    {library.map(song => (
                      <SongItem key={song.id} song={song} displayMode="row" />
                    ))}
                  </div>
                )}
             </div>
           )}

           {/* VIEW: PLAYLISTS */}
           {view === 'playlists' && (
             <div className="p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-bold">{t.playlists.title}</h2>
                   <button 
                     onClick={() => setShowPlaylistModal(true)}
                     className="bg-neon-green text-black font-bold px-4 py-2 rounded-full hover:brightness-110 transition-all flex items-center gap-2"
                   >
                     <Plus size={18} /> {t.playlists.create}
                   </button>
                </div>

                {playlists.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">{t.playlists.empty}</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {playlists.map(pl => (
                      <div 
                        key={pl.id} 
                        onClick={() => { setActivePlaylist(pl); setView('playlist-details'); }}
                        className={`p-4 rounded-xl cursor-pointer group transition-colors ${isLight ? 'bg-white/80 hover:bg-white shadow-lg' : 'bg-[#121212] hover:bg-[#1a1a1a]'}`}
                      >
                        <div className="w-full aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                           {pl.songs.length > 0 ? (
                             <div className="grid grid-cols-2 w-full h-full">
                               {pl.songs.slice(0,4).map(s => <img key={s.id} src={s.coverUrl} className="w-full h-full object-cover"/>)}
                             </div>
                           ) : (
                             <ListMusic size={40} className="text-gray-600" />
                           )}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                             <Play size={30} className="text-white" fill="white" />
                           </div>
                        </div>
                        <h3 className="font-bold truncate">{pl.name}</h3>
                        <p className="text-xs text-gray-500">{pl.songs.length} songs</p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
           )}

           {/* VIEW: PLAYLIST DETAILS */}
           {view === 'playlist-details' && activePlaylist && (
             <div className="p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                   <div className="w-40 h-40 md:w-56 md:h-56 bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex-shrink-0 grid grid-cols-2">
                      {activePlaylist.songs.slice(0,4).map(s => <img key={s.id} src={s.coverUrl} className="w-full h-full object-cover"/>)}
                   </div>
                   <div className="flex flex-col justify-end">
                      <p className="text-xs text-neon-green font-bold uppercase tracking-widest mb-2">Playlist</p>
                      <h1 className="text-4xl md:text-6xl font-black mb-4">{activePlaylist.name}</h1>
                      <div className="flex items-center gap-4">
                         <button onClick={() => { if(activePlaylist.songs.length) playSong(activePlaylist.songs[0]); }} className="w-12 h-12 rounded-full bg-neon-green flex items-center justify-center hover:scale-105 transition-transform">
                           <Play fill="black" className="ml-1" />
                         </button>
                         <button onClick={() => deletePlaylist(activePlaylist.id)} className="text-gray-400 hover:text-red-500">
                           <Trash2 />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="space-y-1">
                   {activePlaylist.songs.length === 0 ? (
                     <div className="text-gray-500 py-10">This playlist is empty. Search for songs to add them!</div>
                   ) : (
                     activePlaylist.songs.map((song, idx) => (
                       <div key={idx + song.id} className="flex items-center group">
                          <span className="w-8 text-center text-gray-500 text-sm font-mono group-hover:text-neon-green">{idx + 1}</span>
                          <div className="flex-1">
                            <SongItem song={song} displayMode="row" />
                          </div>
                       </div>
                     ))
                   )}
                </div>
                
                <button onClick={() => setView('playlists')} className="mt-8 text-sm text-gray-500 hover:text-neon-green">← Back to Playlists</button>
             </div>
           )}

           {/* VIEW: SETTINGS */}
           {view === 'settings' && (
             <div className="p-6 md:p-8 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-8">{t.settings.title}</h2>
                
                <div className="space-y-6">
                   <section className={`rounded-2xl p-6 border ${isLight ? 'bg-white/80 border-gray-200' : 'bg-[#121212] border-gray-800'}`}>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-neon-green"/> {t.settings.language}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                         {['az', 'en', 'tr', 'ru'].map(lang => (
                           <button 
                             key={lang} 
                             onClick={() => setSettings({...settings, language: lang as Language})}
                             className={`py-2 px-4 rounded-lg font-bold uppercase text-sm transition-all ${settings.language === lang ? 'bg-neon-green text-black' : (isLight ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-800 hover:bg-gray-700')}`}
                           >
                             {lang}
                           </button>
                         ))}
                      </div>
                   </section>

                   <section className={`rounded-2xl p-6 border ${isLight ? 'bg-white/80 border-gray-200' : 'bg-[#121212] border-gray-800'}`}>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Loader2 size={18} className="text-neon-green"/> {t.settings.theme}</h3>
                      <div className="flex gap-4">
                          <button 
                             onClick={() => setSettings({...settings, theme: 'deep-neon', background: '#050505'})} 
                             className={`flex-1 p-4 rounded-xl border-2 ${settings.theme === 'deep-neon' ? 'border-neon-green bg-[#050505]' : 'border-transparent bg-gray-800'} text-white`}
                          >
                             Deep Neon
                          </button>
                          <button 
                             onClick={() => setSettings({...settings, theme: 'light-neon', background: '#f3f4f6'})} 
                             className={`flex-1 p-4 rounded-xl border-2 ${settings.theme === 'light-neon' ? 'border-neon-green bg-white' : 'border-transparent bg-gray-200'} text-black`}
                          >
                             Light Neon
                          </button>
                      </div>
                   </section>

                   <section className={`rounded-2xl p-6 border ${isLight ? 'bg-white/80 border-gray-200' : 'bg-[#121212] border-gray-800'}`}>
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><UserIcon size={18} className="text-neon-green"/> Account</h3>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <img src={user.avatarUrl} className="w-12 h-12 rounded-full" alt="user"/>
                            <div>
                               <p className="font-bold">{user.username}</p>
                               <p className="text-xs text-gray-500">ID: {user.id}</p>
                            </div>
                         </div>
                         <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
                            <LogOut size={16}/> {t.settings.logout}
                         </button>
                      </div>
                   </section>

                   <div className="text-center text-xs text-gray-500 pt-10">
                      Version 6.1.6 • Powered by iTunes API
                   </div>
                </div>
             </div>
           )}

        </div>

        {/* --- MODALS --- */}
        
        {/* CREATE PLAYLIST MODAL */}
        {showPlaylistModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div className={`border w-full max-w-md rounded-2xl p-6 shadow-2xl ${isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-gray-700'}`}>
                <h3 className="text-xl font-bold mb-4">{t.playlists.create_title}</h3>
                <input 
                  autoFocus
                  value={newPlaylistName} 
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder={t.playlists.name_placeholder}
                  className={`w-full border rounded-lg p-3 mb-6 focus:border-neon-green focus:outline-none ${isLight ? 'bg-gray-100 border-gray-300 text-black' : 'bg-[#121212] border-gray-700 text-white'}`}
                />
                <div className="flex justify-end gap-3">
                   <button onClick={() => setShowPlaylistModal(false)} className="px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-500/10">Cancel</button>
                   <button onClick={createPlaylist} className="px-6 py-2 rounded-lg bg-neon-green text-black font-bold hover:brightness-110">{t.playlists.create_btn}</button>
                </div>
             </div>
          </div>
        )}

        {/* ADD TO PLAYLIST MODAL */}
        {showAddToPlaylistModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div className={`border w-full max-w-md rounded-2xl p-6 shadow-2xl ${isLight ? 'bg-white border-gray-200' : 'bg-[#1a1a1a] border-gray-700'}`}>
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-bold">{t.player.add_to_pl}</h3>
                   <button onClick={() => setShowAddToPlaylistModal(null)}><X size={20} className="text-gray-500"/></button>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                   {playlists.length === 0 && <p className="text-gray-500 text-center py-4">{t.playlists.empty}</p>}
                   {playlists.map(pl => (
                     <button 
                       key={pl.id}
                       onClick={() => addSongToPlaylist(pl.id, showAddToPlaylistModal)}
                       className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
                     >
                        <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center"><ListMusic size={20} className="text-gray-500"/></div>
                        <div>
                           <p className="font-bold">{pl.name}</p>
                           <p className="text-xs text-gray-500">{pl.songs.length} songs</p>
                        </div>
                     </button>
                   ))}
                </div>
                
                <button 
                   onClick={() => { setShowAddToPlaylistModal(null); setShowPlaylistModal(true); }}
                   className={`w-full py-3 border rounded-lg transition-colors font-bold ${isLight ? 'border-gray-300 text-black hover:bg-gray-50' : 'border-gray-700 text-neon-green hover:bg-neon-green/5'}`}
                >
                   + {t.playlists.create}
                </button>
             </div>
          </div>
        )}

        {/* FIXED PLAYER PANEL */}
        <div className={`fixed bottom-0 left-0 md:left-64 right-0 h-[110px] backdrop-blur-xl border-t z-50 flex flex-col shadow-2xl ${isLight ? 'bg-white/90 border-gray-200 text-black' : 'bg-[#050505]/95 border-gray-800 text-white'}`}>
           {/* Progress Bar */}
           <div 
             className="w-full h-1 bg-gray-600/30 cursor-pointer relative group"
             onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                player.seek(percent * player.duration);
             }}
           >
              <div className="absolute top-0 left-0 h-full bg-neon-green shadow-[0_0_10px_#39ff14]" style={{ width: `${(player.progress / (player.duration || 1)) * 100}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-neon-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity left-[var(--prog)]" style={{ left: `${(player.progress / (player.duration || 1)) * 100}%` } as any} />
           </div>

           <div className="flex-1 flex items-center justify-between px-4 md:px-8">
              {/* Song Info */}
              <div className="flex items-center w-1/3 gap-3 overflow-hidden">
                 {currentSong ? (
                   <>
                     <img src={currentSong.coverUrl} className={`w-12 h-12 rounded-md border border-gray-800 ${player.isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} alt="Art" />
                     <div className="min-w-0">
                        <h4 className="font-bold truncate text-sm">{currentSong.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{currentSong.artist}</p>
                     </div>
                   </>
                 ) : (
                   <div className="flex items-center gap-3 opacity-50">
                       <div className="w-12 h-12 bg-gray-700 rounded-md animate-pulse" />
                       <div className="hidden sm:block space-y-2">
                          <div className="w-20 h-3 bg-gray-700 rounded animate-pulse"/>
                          <div className="w-12 h-2 bg-gray-700 rounded animate-pulse"/>
                       </div>
                   </div>
                 )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 md:gap-6 flex-1">
                 <button onClick={() => player.skip(-10)} className="text-gray-500 hover:text-neon-green transition-colors"><RotateCcw size={20} /></button>
                 <button onClick={player.togglePlay} className="w-12 h-12 rounded-full bg-neon-green text-black flex items-center justify-center hover:scale-105 hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all shadow-lg">
                   {player.isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                 </button>
                 <button onClick={() => player.skip(10)} className="text-gray-500 hover:text-neon-green transition-colors"><RotateCw size={20} /></button>
              </div>

              {/* Volume */}
              <div className="w-1/3 flex justify-end items-center gap-3">
                 <Volume2 size={18} className="text-gray-500 hidden sm:block" />
                 <input 
                   type="range" min="0" max="1" step="0.01" 
                   value={settings.volume} 
                   onChange={(e) => setSettings({...settings, volume: parseFloat(e.target.value)})} 
                   className="w-20 h-1 bg-gray-500 rounded-full appearance-none cursor-pointer accent-neon-green"
                 />
              </div>
           </div>
        </div>

        {/* MOBILE NAV */}
        <div className={`md:hidden fixed bottom-[110px] left-0 right-0 backdrop-blur-md flex justify-around p-3 border-t z-40 ${isLight ? 'bg-white/90 border-gray-200' : 'bg-black/90 border-gray-800'}`}>
           {[ { id: 'home', icon: Home }, { id: 'search', icon: Search }, { id: 'library', icon: Library }, { id: 'playlists', icon: ListMusic } ].map(item => (
             <button key={item.id} onClick={() => setView(item.id as ViewState)} className={`p-2 rounded-full ${view === item.id ? 'text-neon-green bg-neon-green/10' : 'text-gray-400'}`}>
                <item.icon size={24} />
             </button>
           ))}
        </div>
      </main>
    </div>
  );
}
