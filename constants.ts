
import { Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  az: {
    app_name: "616",
    nav: { home: "Ana Səhifə", search: "Axtarış", library: "Kitabxana", playlists: "Pleylistlər", settings: "Tənzimləmələr" },
    search: { placeholder: "Mahnı, sənətçi və ya albom...", no_results: "Nəticə tapılmadı.", trending: "Trendlər" },
    player: { now_playing: "İndi Oxunur", next: "Növbəti", unknown: "Naməlum", add_to_lib: "Kitabxanaya əlavə et", add_to_pl: "Pleylistə əlavə et" },
    playlists: { title: "Mənim Pleylistlərim", create: "Yeni Pleylist", create_title: "Pleylist Yarat", name_placeholder: "Məs: Rəqs Musiqisi", create_btn: "Yarat", delete: "Sil", empty: "Pleylist yoxdur", add_success: "Əlavə edildi!" },
    settings: { 
      title: "Tənzimləmələr", language: "Dil", theme: "Mövzu", audio: "Səs", bg_color: "Arxa Fon Rəngi", bg_image: "Arxa Fon Şəkli", logout: "Çıxış"
    },
    auth: { 
      login: "Giriş", 
      register: "Qeydiyyat", 
      guest: "Qonaq", 
      username: "İstifadəçi adı", 
      password: "Şifrə", 
      welcome: "Xoş gəldin", 
      have_account: "Hesabınız var? Giriş", 
      no_account: "Hesabınız yoxdur? Qeydiyyat", 
      guest_continue: "Qonaq kimi davam et",
      error_exists: "İstifadəçi artıq mövcuddur", 
      error_not_found: "İstifadəçi tapılmadı", 
      error_password: "Şifrə yanlışdır", 
      error_empty: "Xanaları doldurun",
      register_title: "Yeni Hesab Yarat",
      login_title: "Hesabınıza Giriş Edin",
      subtitle: "Neon musiqi dünyasına xoş gəlmisiniz"
    },
    library: { favorites: "Bəyənilənlər", empty: "Hələ heç nə yoxdur." },
    home: { featured: "Seçilmişlər", top_hits: "Ən Çox Dinlənilən" }
  },
  en: {
    app_name: "616",
    nav: { home: "Home", search: "Search", library: "Library", playlists: "Playlists", settings: "Settings" },
    search: { placeholder: "Song, artist, or album...", no_results: "No results found.", trending: "Trending" },
    player: { now_playing: "Now Playing", next: "Next", unknown: "Unknown", add_to_lib: "Add to Library", add_to_pl: "Add to Playlist" },
    playlists: { title: "My Playlists", create: "New Playlist", create_title: "Create Playlist", name_placeholder: "Ex: Dance Hits", create_btn: "Create", delete: "Delete", empty: "No playlists yet", add_success: "Added!" },
    settings: { 
      title: "Settings", language: "Language", theme: "Theme", audio: "Audio", bg_color: "Background Color", bg_image: "Background Image", logout: "Log Out"
    },
    auth: { 
      login: "Login", 
      register: "Sign Up", 
      guest: "Guest", 
      username: "Username", 
      password: "Password", 
      welcome: "Welcome", 
      have_account: "Already have an account? Login", 
      no_account: "No account? Sign Up", 
      guest_continue: "Continue as Guest",
      error_exists: "User already exists", 
      error_not_found: "User not found", 
      error_password: "Incorrect password", 
      error_empty: "Please fill all fields",
      register_title: "Create Account",
      login_title: "Login to Account",
      subtitle: "Welcome to the neon music world"
    },
    library: { favorites: "Favorites", empty: "Nothing here yet." },
    home: { featured: "Featured", top_hits: "Top Hits" }
  },
  tr: {
    app_name: "616",
    nav: { home: "Ana Sayfa", search: "Ara", library: "Kitaplık", playlists: "Çalma Listeleri", settings: "Ayarlar" },
    search: { placeholder: "Şarkı, sanatçı veya albüm...", no_results: "Sonuç bulunamadı.", trending: "Trendler" },
    player: { now_playing: "Şu An Çalıyor", next: "Sıradaki", unknown: "Bilinmiyor", add_to_lib: "Kitaplığa Ekle", add_to_pl: "Listeye Ekle" },
    playlists: { title: "Çalma Listelerim", create: "Yeni Liste", create_title: "Liste Oluştur", name_placeholder: "Örn: Dans", create_btn: "Oluştur", delete: "Sil", empty: "Henüz liste yok", add_success: "Eklendi!" },
    settings: { 
      title: "Ayarlar", language: "Dil", theme: "Tema", audio: "Ses", bg_color: "Arka Plan Rengi", bg_image: "Arka Plan Resmi", logout: "Çıkış Yap"
    },
    auth: { 
      login: "Giriş", 
      register: "Kayıt Ol", 
      guest: "Misafir", 
      username: "Kullanıcı Adı", 
      password: "Şifre", 
      welcome: "Hoş geldin", 
      have_account: "Hesabın var mı? Giriş", 
      no_account: "Hesabın yok mu? Kayıt Ol", 
      guest_continue: "Misafir olarak devam et",
      error_exists: "Kullanıcı zaten mevcut", 
      error_not_found: "Kullanıcı bulunamadı", 
      error_password: "Şifre yanlış", 
      error_empty: "Lütfen tüm alanları doldurun",
      register_title: "Hesap Oluştur",
      login_title: "Giriş Yap",
      subtitle: "Neon müzik dünyasına hoş geldiniz"
    },
    library: { favorites: "Favoriler", empty: "Henüz bir şey yok." },
    home: { featured: "Öne Çıkanlar", top_hits: "Popüler" }
  },
  ru: {
    app_name: "616",
    nav: { home: "Главная", search: "Поиск", library: "Медиатека", playlists: "Плейлисты", settings: "Настройки" },
    search: { placeholder: "Песня, артист или альбом...", no_results: "Ничего не найдено.", trending: "Тренды" },
    player: { now_playing: "Сейчас играет", next: "Далее", unknown: "Неизвестно", add_to_lib: "В медиатеку", add_to_pl: "В плейлист" },
    playlists: { title: "Мои плейлисты", create: "Новый плейлист", create_title: "Создать плейлист", name_placeholder: "Напр: Танцевальная", create_btn: "Создать", delete: "Удалить", empty: "Плейлистов нет", add_success: "Добавлено!" },
    settings: { 
      title: "Настройки", language: "Язык", theme: "Тема", audio: "Звук", bg_color: "Цвет фона", bg_image: "Изображение фона", logout: "Выйти"
    },
    auth: { 
      login: "Войти", 
      register: "Регистрация", 
      guest: "Гость", 
      username: "Имя пользователя", 
      password: "Пароль", 
      welcome: "Добро пожаловать", 
      have_account: "Есть аккаунт? Войти", 
      no_account: "Нет аккаунта? Регистрация", 
      guest_continue: "Войти как гость",
      error_exists: "Пользователь уже существует", 
      error_not_found: "Пользователь не найден", 
      error_password: "Неверный пароль", 
      error_empty: "Заполните все поля",
      register_title: "Создать аккаунт",
      login_title: "Войти в аккаунт",
      subtitle: "Добро пожаловать в неоновый мир музыки"
    },
    library: { favorites: "Избранное", empty: "Пока пусто." },
    home: { featured: "Избранное", top_hits: "Топ Хитоы" }
  }
};

export const INITIAL_QUERIES = [
  "The Weeknd", "Dua Lipa", "Imagine Dragons", "Röya", "Miri Yusif", "Arctic Monkeys", "Daft Punk", "Kavinsky"
];

export const BG_PRESETS = [
  { id: 'deep', value: '#050505' },
  { id: 'gradient-1', value: 'linear-gradient(to bottom right, #050505, #0a1a0a)' },
  { id: 'gradient-2', value: 'linear-gradient(to bottom right, #000000, #1a0505)' },
  { id: 'gradient-3', value: 'linear-gradient(to bottom right, #000000, #051a1a)' },
];
