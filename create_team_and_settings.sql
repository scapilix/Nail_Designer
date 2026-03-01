-- ========================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- Cria as tabelas em falta + insere dados
-- ========================================

-- 1. TABELA TEAM_MEMBERS (profissionais)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  commission_rate NUMERIC DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA SETTINGS (configurações do salão)
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  salon_name TEXT DEFAULT 'TO Beauty',
  phone TEXT,
  email TEXT,
  address TEXT,
  opening_hours TEXT DEFAULT '09:00 - 20:00',
  days_open TEXT DEFAULT 'Segunda a Sábado',
  slot_duration INTEGER DEFAULT 15,
  allow_online_booking BOOLEAN DEFAULT true,
  auto_confirm_booking BOOLEAN DEFAULT false,
  send_sms_reminder BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 30,
  primary_color TEXT DEFAULT '#B48228',
  currency TEXT DEFAULT 'EUR',
  timezone TEXT DEFAULT 'Europe/Lisbon',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS - permitir acesso
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.team_members;
CREATE POLICY "Allow all" ON public.team_members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.settings;
CREATE POLICY "Allow all" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- 4. LIMPAR E INSERIR 3 PROFISSIONAIS
DELETE FROM public.team_members;

INSERT INTO public.team_members (name, role, phone, email, commission_rate, photo_url) VALUES
(
  'Letícia Silva',
  'Nail Designer Sénior',
  '+351 912 345 678',
  'leticia@tobeauty.pt',
  40,
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop'
),
(
  'Ana Santos',
  'Esteticista',
  '+351 923 456 789',
  'ana@tobeauty.pt',
  35,
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop'
),
(
  'Carla Mendes',
  'Nail Designer',
  '+351 934 567 890',
  'carla@tobeauty.pt',
  40,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop'
);

-- 5. INSERIR DEFINIÇÕES DO SALÃO
INSERT INTO public.settings (id, salon_name, phone, email, address, primary_color)
VALUES (1, 'TO Beauty', '+351 912 345 678', 'info@tobeauty.pt', 'Rua da Beleza 123, Lisboa', '#B48228')
ON CONFLICT (id) DO NOTHING;
