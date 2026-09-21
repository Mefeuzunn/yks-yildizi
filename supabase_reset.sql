-- 1. Eski tabloyu (hatalı veya eksik sütunları olan) tamamen sil
DROP TABLE IF EXISTS public.focus_sessions CASCADE;

-- 2. Tabloyu en doğru ve eksiksiz haliyle yeniden oluştur
CREATE TABLE public.focus_sessions (
    -- Benzersiz ID
    id text PRIMARY KEY,
    
    -- Kullanıcı ID (Özel auth sisteminizdeki users tablosuyla eşleşir)
    user_id text NOT NULL,
    
    -- Odak oturumu detayları
    subject text,
    topic text,
    task_name text,
    
    -- Çalışma modu (pomodoro, shortBreak, longBreak vb.)
    mode text DEFAULT 'pomodoro',
    
    -- Süre (Hem eski hem yeni API kodlarınız için iki sütun da eklendi)
    duration_min integer DEFAULT 0,
    duration_minutes integer DEFAULT 0,
    
    -- Tarih (Hem eski hem yeni kodlar için)
    started_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- 3. (İsteğe bağlı) Eğer Supabase RLS açıksa, backendin rahatça yazabilmesi için geçici olarak devre dışı bırakın
ALTER TABLE public.focus_sessions DISABLE ROW LEVEL SECURITY;
