-- =============================================
-- TO BEAUTY ERP - CONFIGURAÇÃO COMPLETA DA BASE DE DADOS
-- Execute este script COMPLETO no SQL Editor do Supabase
-- FEVEREIRO 2026 - Mês de trabalho simulado
-- =============================================

-- ==================
-- 1. CRIAR TABELAS
-- ==================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, birthday DATE,
  address TEXT, referral_source TEXT, notes TEXT,
  total_spent NUMERIC DEFAULT 0, visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT, duration INTEGER DEFAULT 30,
  price NUMERIC DEFAULT 0, description TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, role TEXT, phone TEXT, email TEXT,
  commission_rate NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT, brand TEXT,
  stock_quantity INTEGER DEFAULT 0, min_stock INTEGER DEFAULT 5,
  price NUMERIC DEFAULT 0, cost_price NUMERIC DEFAULT 0,
  total_sold INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID, service_id UUID, team_member_id UUID,
  booking_date DATE NOT NULL, booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'pendente', notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID, client_name TEXT, service_name TEXT,
  total_amount NUMERIC DEFAULT 0, status TEXT DEFAULT 'pendente',
  payment_method TEXT DEFAULT 'dinheiro', date DATE,
  issue_date TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL, category TEXT, amount NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE, notes TEXT,
  paid_to TEXT, attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, price NUMERIC DEFAULT 0,
  sessions INTEGER DEFAULT 1, validity_days INTEGER DEFAULT 30,
  services_included TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT, total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'aberta', payment_method TEXT,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID, member_name TEXT,
  amount NUMERIC DEFAULT 0, rate NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE, status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cash_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, amount NUMERIC NOT NULL,
  description TEXT, payment_method TEXT,
  date DATE DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0, period TEXT DEFAULT 'mensal',
  start_date DATE, end_date DATE, status TEXT DEFAULT 'ativa',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID, client_name TEXT,
  allergies TEXT, medications TEXT, health_conditions TEXT,
  skin_type TEXT, nail_conditions TEXT, preferences TEXT,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key TEXT UNIQUE NOT NULL, image_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  salon_name TEXT DEFAULT 'TO Beauty',
  phone TEXT, email TEXT, address TEXT,
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

-- ==================
-- 2. COLUNAS EM FALTA (seguro para executar várias vezes)
-- ==================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'dinheiro';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS paid_to TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- ==================
-- 3. POLÍTICAS RLS (permitir tudo para desenvolvimento)
-- ==================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','services','team_members','products','bookings',
    'invoices','expenses','plans','orders','commissions',
    'cash_register','goals','anamnesis','site_images','settings'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow all" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ==================
-- 4. DADOS DE FEVEREIRO 2026
-- ==================

-- Limpar dados antigos para evitar duplicados
TRUNCATE public.bookings, public.invoices, public.expenses, public.orders,
         public.commissions, public.cash_register, public.goals, public.anamnesis CASCADE;
DELETE FROM public.clients;
DELETE FROM public.services;
DELETE FROM public.team_members;
DELETE FROM public.products;
DELETE FROM public.plans;
DELETE FROM public.settings;

-- === 12 CLIENTES ===
INSERT INTO public.clients (name, email, phone, birthday, address, referral_source, total_spent, visit_count, last_visit) VALUES
  ('Maria Oliveira',    'maria.oliveira@email.com',  '912345678', '1990-05-15', 'Rua da Liberdade 45, Lisboa',    'Instagram',   680.00, 18, '2026-02-27'),
  ('Ana Pereira',       'ana.pereira@email.com',     '915555555', '1988-08-22', 'Av. da República 120, Lisboa',   'Indicação',   520.00, 14, '2026-02-26'),
  ('Cláudia Vieira',    'claudia.vieira@email.com',  '913333333', '1995-03-10', 'Rua Augusta 78, Lisboa',         'Google',      380.00, 10, '2026-02-25'),
  ('Sofia Costa',       'sofia.costa@email.com',     '916666666', '1992-11-28', 'Praça do Comércio 30, Lisboa',   'Facebook',    290.00,  8, '2026-02-24'),
  ('Beatriz Santos',    'beatriz.s@email.com',       '917777777', '1998-01-05', 'Rua de Santa Catarina 200, Porto','Amiga',      350.00, 10, '2026-02-27'),
  ('Inês Rodrigues',    'ines.r@email.com',          '918888888', '1993-07-19', 'Av. dos Aliados 50, Porto',      'Website',     440.00, 12, '2026-02-26'),
  ('Marta Ribeiro',     'marta.rib@email.com',       '919999999', '1985-12-03', 'Rua do Almada 15, Porto',        'Instagram',   260.00,  7, '2026-02-25'),
  ('Joana Ferreira',    'joana.f@email.com',         '911111111', '1997-04-25', 'Rua da Boavista 88, Porto',      'Indicação',   190.00,  5, '2026-02-21'),
  ('Carolina Lopes',    'carolina.l@email.com',      '912222222', '1991-09-14', 'Rua Garrett 32, Lisboa',         'Google',      310.00,  9, '2026-02-23'),
  ('Diana Martins',     'diana.m@email.com',         '913444444', '1994-06-08', 'Av. da Liberdade 200, Lisboa',   'Instagram',   420.00, 11, '2026-02-27'),
  ('Filipa Sousa',      'filipa.s@email.com',        '914555555', '1989-02-20', 'Rua do Carmo 66, Lisboa',        'Facebook',    175.00,  5, '2026-02-20'),
  ('Teresa Almeida',    'teresa.a@email.com',        '915666666', '1996-10-31', 'Rua de Cedofeita 44, Porto',     'Amiga',       230.00,  6, '2026-02-22');

-- === 12 SERVIÇOS ===
INSERT INTO public.services (name, category, duration, price, description) VALUES
  ('Manicure Clássica',    'Manicure',   45,  20.00, 'Manicure tradicional com corte, limar e esmaltado'),
  ('Manicure Gel',         'Manicure',   60,  35.00, 'Aplicação de verniz gel com duração até 3 semanas'),
  ('Manicure Russa',       'Manicure',   75,  45.00, 'Técnica russa com broca e cutícula perfeita'),
  ('Pedicure Spa',         'Pedicure',   75,  40.00, 'Pedicure completa com spa de pés e esfoliação'),
  ('Pedicure Gel',         'Pedicure',   90,  50.00, 'Pedicure com aplicação de verniz gel'),
  ('Nail Art Premium',     'Nail Art',   90,  55.00, 'Decoração artística personalizada'),
  ('Nail Art Simples',     'Nail Art',   60,  30.00, 'Decoração básica com 2-3 unhas destaque'),
  ('Alongamento Acrílico', 'Alongamento',120, 65.00, 'Extensão de unhas com acrílico'),
  ('Alongamento Gel',      'Alongamento',120, 70.00, 'Extensão de unhas com gel moldado'),
  ('Manutenção Gel',       'Manutenção',  60, 30.00, 'Preenchimento e manutenção de gel'),
  ('Remoção de Gel',       'Manutenção',  30, 15.00, 'Remoção segura de verniz gel ou acrílico'),
  ('Verniz Gel Premium',   'Manicure',   60,  40.00, 'Verniz gel com marcas premium importadas');

-- === 3 PROFISSIONAIS ===
INSERT INTO public.team_members (name, role, phone, email, commission_rate) VALUES
  ('Leticia Silva',  'Nail Designer Sénior', '+351 912 345 678', 'leticia@tobeauty.pt', 40),
  ('Ana Santos',     'Esteticista',          '+351 923 456 789', 'ana@tobeauty.pt',     35),
  ('Carla Mendes',   'Nail Designer',        '+351 934 567 890', 'carla@tobeauty.pt',   40);

-- === DEFINIÇÕES DO SALÃO ===
INSERT INTO public.settings (id, salon_name, phone, email, address, primary_color, currency, timezone) VALUES
  (1, 'TO Beauty', '+351 912 345 678', 'info@tobeauty.pt', 'Rua da Beleza 123, Lisboa', '#B48228', 'EUR', 'Europe/Lisbon');

-- === 12 PRODUTOS ===
INSERT INTO public.products (name, category, brand, stock_quantity, min_stock, price, cost_price, total_sold) VALUES
  ('Gel de Construção Rosa',     'Material',  'Moyra',       15,  5, 25.99, 12.00,  42),
  ('Verniz Gel Vermelho Paixão', 'Material',  'CND Shellac',  8,  3, 12.50,  6.00,  87),
  ('Creme de Mãos Karité',      'Revenda',   'L''Occitane',  30, 10, 18.00,  8.50, 120),
  ('Óleo de Cutículas',          'Revenda',   'OPI',          50, 10,  9.50,  4.00, 200),
  ('Top Coat Brilhante',        'Material',  'Gelish',       12,  5, 15.00,  7.00,  65),
  ('Base Fortalecedora',        'Material',  'IBD',           20,  5, 14.00,  6.50,  55),
  ('Lima 180/240',              'Consumível','Staleks',      100, 20,  2.50,  0.80, 350),
  ('Removedor de Gel',          'Consumível','Moyra',         25, 10,  8.00,  3.50,  90),
  ('Kit Nail Art Pincéis',      'Ferramenta','Kolinsky',       5,  2, 45.00, 22.00,  15),
  ('Verniz Gel Nude Natural',   'Material',  'CND Shellac',   3,  5, 12.50,  6.00,  92),
  ('Acetona Pura 1L',           'Consumível','Quimivest',     10,  5,  6.00,  2.50,  40),
  ('Primer Ácido',              'Material',  'IBD',           18,  5, 11.00,  5.00,  30);

-- === ~80 AGENDAMENTOS (20 por profissional em Fev 2026, Seg-Sáb) ===
-- Leticia Silva (~20 marcações)
INSERT INTO public.bookings (booking_date, booking_time, status, notes) VALUES
  ('2026-02-02','09:00','concluido','Manicure gel - Maria O.'),
  ('2026-02-02','10:30','concluido','Nail art premium - Ana P.'),
  ('2026-02-03','09:00','concluido','Alongamento gel - Cláudia V.'),
  ('2026-02-03','11:00','concluido','Manicure russa - Sofia C.'),
  ('2026-02-04','09:30','concluido','Pedicure spa - Beatriz S.'),
  ('2026-02-05','09:00','concluido','Manicure gel - Inês R.'),
  ('2026-02-05','10:30','concluido','Verniz gel premium - Marta R.'),
  ('2026-02-06','09:00','concluido','Manicure russa - Joana F.'),
  ('2026-02-06','11:00','concluido','Nail art simples - Carolina L.'),
  ('2026-02-09','09:00','concluido','Manicure gel - Diana M.'),
  ('2026-02-09','10:30','concluido','Pedicure gel - Maria O.'),
  ('2026-02-10','09:00','concluido','Alongamento acrílico - Ana P.'),
  ('2026-02-11','09:30','concluido','Manutenção gel - Filipa S.'),
  ('2026-02-12','09:00','concluido','Manicure gel - Teresa A.'),
  ('2026-02-13','10:00','concluido','Nail art premium - Beatriz S.'),
  ('2026-02-16','09:00','concluido','Manicure russa - Cláudia V.'),
  ('2026-02-17','09:30','concluido','Pedicure spa - Sofia C.'),
  ('2026-02-18','09:00','concluido','Manicure gel - Inês R.'),
  ('2026-02-23','09:00','concluido','Alongamento gel - Maria O.'),
  ('2026-02-24','09:30','concluido','Verniz gel premium - Ana P.'),
-- Ana Santos (~20 marcações)
  ('2026-02-02','10:00','concluido','Pedicure spa - Marta R.'),
  ('2026-02-02','14:00','concluido','Manicure clássica - Joana F.'),
  ('2026-02-03','10:00','concluido','Manicure gel - Carolina L.'),
  ('2026-02-03','14:00','concluido','Pedicure gel - Diana M.'),
  ('2026-02-04','10:00','concluido','Manicure russa - Filipa S.'),
  ('2026-02-05','10:00','concluido','Remoção de gel - Teresa A.'),
  ('2026-02-05','14:00','concluido','Manicure gel - Maria O.'),
  ('2026-02-06','10:00','concluido','Pedicure spa - Ana P.'),
  ('2026-02-09','10:00','concluido','Manicure clássica - Cláudia V.'),
  ('2026-02-09','14:00','concluido','Nail art simples - Sofia C.'),
  ('2026-02-10','10:00','concluido','Manicure gel - Beatriz S.'),
  ('2026-02-11','10:00','concluido','Manutenção gel - Inês R.'),
  ('2026-02-12','10:00','concluido','Manicure russa - Marta R.'),
  ('2026-02-13','10:00','concluido','Pedicure spa - Joana F.'),
  ('2026-02-16','10:00','concluido','Manicure gel - Carolina L.'),
  ('2026-02-17','10:00','concluido','Remoção de gel - Diana M.'),
  ('2026-02-18','10:00','concluido','Pedicure gel - Filipa S.'),
  ('2026-02-19','10:00','concluido','Manicure gel - Teresa A.'),
  ('2026-02-23','10:00','concluido','Nail art simples - Maria O.'),
  ('2026-02-24','10:00','concluido','Manicure russa - Ana P.'),
-- Carla Mendes (~20 marcações)
  ('2026-02-02','11:00','concluido','Nail art premium - Cláudia V.'),
  ('2026-02-02','14:30','concluido','Manicure gel - Sofia C.'),
  ('2026-02-03','11:00','concluido','Pedicure gel - Beatriz S.'),
  ('2026-02-04','11:00','concluido','Alongamento gel - Inês R.'),
  ('2026-02-04','14:00','concluido','Manicure russa - Marta R.'),
  ('2026-02-05','11:00','concluido','Manicure gel - Joana F.'),
  ('2026-02-06','11:30','concluido','Verniz gel premium - Carolina L.'),
  ('2026-02-09','11:00','concluido','Pedicure spa - Diana M.'),
  ('2026-02-10','11:00','concluido','Manicure gel - Filipa S.'),
  ('2026-02-10','14:00','concluido','Nail art simples - Teresa A.'),
  ('2026-02-11','11:00','concluido','Manicure russa - Maria O.'),
  ('2026-02-12','11:00','concluido','Alongamento acrílico - Ana P.'),
  ('2026-02-13','11:00','concluido','Manicure gel - Cláudia V.'),
  ('2026-02-16','11:00','concluido','Pedicure gel - Sofia C.'),
  ('2026-02-16','14:00','concluido','Manutenção gel - Beatriz S.'),
  ('2026-02-17','11:00','concluido','Nail art premium - Inês R.'),
  ('2026-02-18','11:00','concluido','Manicure gel - Marta R.'),
  ('2026-02-19','11:00','concluido','Pedicure spa - Joana F.'),
  ('2026-02-23','11:00','concluido','Manicure russa - Carolina L.'),
  ('2026-02-24','11:00','concluido','Verniz gel premium - Diana M.'),
-- Rita Almeida (~20 marcações)
  ('2026-02-02','14:00','concluido','Manicure clássica - Filipa S.'),
  ('2026-02-03','14:00','concluido','Remoção de gel - Teresa A.'),
  ('2026-02-04','14:00','concluido','Manicure clássica - Maria O.'),
  ('2026-02-05','14:00','concluido','Manutenção gel - Ana P.'),
  ('2026-02-06','14:00','concluido','Manicure clássica - Cláudia V.'),
  ('2026-02-09','14:00','concluido','Remoção de gel - Sofia C.'),
  ('2026-02-10','14:30','concluido','Manicure clássica - Beatriz S.'),
  ('2026-02-11','14:00','concluido','Manutenção gel - Inês R.'),
  ('2026-02-12','14:00','concluido','Manicure clássica - Marta R.'),
  ('2026-02-13','14:00','concluido','Remoção de gel - Joana F.'),
  ('2026-02-16','14:00','concluido','Manicure clássica - Carolina L.'),
  ('2026-02-17','14:00','concluido','Manutenção gel - Diana M.'),
  ('2026-02-18','14:00','concluido','Manicure clássica - Filipa S.'),
  ('2026-02-19','14:00','concluido','Remoção de gel - Teresa A.'),
  ('2026-02-20','09:00','concluido','Manicure clássica - Maria O.'),
  ('2026-02-20','10:30','concluido','Manutenção gel - Ana P.'),
  ('2026-02-23','14:00','concluido','Manicure clássica - Cláudia V.'),
  ('2026-02-24','14:00','concluido','Remoção de gel - Sofia C.'),
  ('2026-02-25','09:00','concluido','Manicure clássica - Beatriz S.'),
  ('2026-02-25','10:30','concluido','Manutenção gel - Inês R.'),
-- Agendamentos de HOJE (28 Fev) e próximos
  ('2026-02-28','09:00','confirmado','Manicure gel - Maria O.'),
  ('2026-02-28','09:30','confirmado','Pedicure spa - Ana P.'),
  ('2026-02-28','10:00','pendente','Nail art premium - Cláudia V.'),
  ('2026-02-28','10:30','confirmado','Manicure russa - Sofia C.'),
  ('2026-02-28','11:00','pendente','Alongamento gel - Beatriz S.'),
  ('2026-02-28','14:00','confirmado','Manicure gel - Inês R.'),
  ('2026-02-28','14:30','pendente','Pedicure gel - Marta R.'),
  ('2026-02-28','15:00','confirmado','Verniz gel premium - Carolina L.');

-- === 40+ TRANSAÇÕES/FATURAS (Fev 2026) ===
INSERT INTO public.invoices (client_name, service_name, total_amount, status, payment_method, date) VALUES
  ('Maria Oliveira',  'Manicure Gel',         35.00,'pago','mbway','2026-02-02'),
  ('Ana Pereira',     'Nail Art Premium',      55.00,'pago','cartao','2026-02-02'),
  ('Cláudia Vieira',  'Alongamento Gel',       70.00,'pago','cartao','2026-02-03'),
  ('Sofia Costa',     'Manicure Russa',        45.00,'pago','dinheiro','2026-02-03'),
  ('Beatriz Santos',  'Pedicure Spa',          40.00,'pago','mbway','2026-02-04'),
  ('Inês Rodrigues',  'Manicure Gel',          35.00,'pago','cartao','2026-02-05'),
  ('Marta Ribeiro',   'Verniz Gel Premium',    40.00,'pago','dinheiro','2026-02-05'),
  ('Joana Ferreira',  'Manicure Russa',        45.00,'pago','mbway','2026-02-06'),
  ('Carolina Lopes',  'Nail Art Simples',      30.00,'pago','cartao','2026-02-06'),
  ('Diana Martins',   'Manicure Gel',          35.00,'pago','mbway','2026-02-09'),
  ('Maria Oliveira',  'Pedicure Gel',          50.00,'pago','cartao','2026-02-09'),
  ('Ana Pereira',     'Alongamento Acrílico',  65.00,'pago','cartao','2026-02-10'),
  ('Filipa Sousa',    'Manutenção Gel',        30.00,'pago','dinheiro','2026-02-11'),
  ('Teresa Almeida',  'Manicure Gel',          35.00,'pago','mbway','2026-02-12'),
  ('Beatriz Santos',  'Nail Art Premium',      55.00,'pago','cartao','2026-02-13'),
  ('Cláudia Vieira',  'Manicure Russa',        45.00,'pago','dinheiro','2026-02-16'),
  ('Sofia Costa',     'Pedicure Spa',          40.00,'pago','mbway','2026-02-17'),
  ('Inês Rodrigues',  'Manicure Gel',          35.00,'pago','cartao','2026-02-18'),
  ('Maria Oliveira',  'Alongamento Gel',       70.00,'pago','mbway','2026-02-23'),
  ('Ana Pereira',     'Verniz Gel Premium',    40.00,'pago','cartao','2026-02-24'),
  ('Marta Ribeiro',   'Pedicure Spa',          40.00,'pago','dinheiro','2026-02-02'),
  ('Joana Ferreira',  'Manicure Clássica',     20.00,'pago','dinheiro','2026-02-02'),
  ('Carolina Lopes',  'Manicure Gel',          35.00,'pago','mbway','2026-02-03'),
  ('Diana Martins',   'Pedicure Gel',          50.00,'pago','cartao','2026-02-03'),
  ('Filipa Sousa',    'Manicure Russa',        45.00,'pago','cartao','2026-02-04'),
  ('Teresa Almeida',  'Remoção de Gel',        15.00,'pago','dinheiro','2026-02-05'),
  ('Maria Oliveira',  'Manicure Gel',          35.00,'pago','mbway','2026-02-05'),
  ('Ana Pereira',     'Pedicure Spa',          40.00,'pago','cartao','2026-02-06'),
  ('Cláudia Vieira',  'Nail Art Premium',      55.00,'pago','cartao','2026-02-02'),
  ('Sofia Costa',     'Manicure Gel',          35.00,'pago','dinheiro','2026-02-02'),
  ('Beatriz Santos',  'Pedicure Gel',          50.00,'pago','mbway','2026-02-03'),
  ('Inês Rodrigues',  'Alongamento Gel',       70.00,'pago','cartao','2026-02-04'),
  ('Marta Ribeiro',   'Manicure Russa',        45.00,'pago','mbway','2026-02-04'),
  ('Joana Ferreira',  'Manicure Gel',          35.00,'pago','dinheiro','2026-02-05'),
  ('Carolina Lopes',  'Verniz Gel Premium',    40.00,'pago','cartao','2026-02-06'),
  ('Diana Martins',   'Pedicure Spa',          40.00,'pago','mbway','2026-02-09'),
  ('Filipa Sousa',    'Manicure Gel',          35.00,'pago','cartao','2026-02-10'),
  ('Teresa Almeida',  'Nail Art Simples',      30.00,'pago','dinheiro','2026-02-10'),
  ('Filipa Sousa',    'Manicure Clássica',     20.00,'pago','dinheiro','2026-02-02'),
  ('Teresa Almeida',  'Remoção de Gel',        15.00,'pago','dinheiro','2026-02-03'),
  ('Maria Oliveira',  'Manicure Clássica',     20.00,'pago','mbway','2026-02-04'),
  ('Sofia Costa',     'Remoção de Gel',        15.00,'pago','dinheiro','2026-02-09'),
  ('Beatriz Santos',  'Manicure Clássica',     20.00,'pago','mbway','2026-02-10'),
  ('Inês Rodrigues',  'Manutenção Gel',        30.00,'pago','cartao','2026-02-11'),
  ('Maria Oliveira',  'Manicure Gel',          35.00,'pendente','mbway','2026-02-28'),
  ('Cláudia Vieira',  'Nail Art Premium',      55.00,'pendente','cartao','2026-02-28');

-- === DESPESAS Fev 2026 (com campo paid_to) ===
INSERT INTO public.expenses (description, category, amount, date, paid_to, notes) VALUES
  ('Renda do Salão - Fevereiro',       'renda',     1500.00, '2026-02-01', 'Imobiliária Lisboa Premium', 'Pagamento mensal via transferência'),
  ('Eletricidade - Fevereiro',         'utility',    195.00, '2026-02-05', 'EDP Comercial',       'Fatura nº 2026-0205'),
  ('Água - Fevereiro',                 'utility',     48.00, '2026-02-05', 'EPAL',                NULL),
  ('Internet Fibra - Fevereiro',       'utility',     38.00, '2026-02-03', 'NOS',                 'Contrato empresarial'),
  ('Fornecedor Moyra - Géis e Bases',  'fornecedor', 520.00, '2026-02-04', 'Moyra Portugal Lda.', 'Encomenda trimestral - 15 géis + 8 bases'),
  ('Fornecedor Staleks - Limas/Brocas','fornecedor', 145.00, '2026-02-06', 'Staleks Ibérica',     '200 limas + 5 brocas diamante'),
  ('Instagram Ads - Campanha Fev',     'marketing',  250.00, '2026-02-07', 'Meta Platforms',      'Campanha "Promoção Fevereiro"'),
  ('Seguro do Salão - Fevereiro',      'outros',     155.00, '2026-02-01', 'Fidelidade Seguros',  'Seguro multirriscos anual'),
  ('Produtos de Limpeza',              'fornecedor',  72.00, '2026-02-10', 'Makro Portugal',      'Desinfetantes + toalhas'),
  ('Manutenção Ar Condicionado',       'outros',     190.00, '2026-02-12', 'ClimaFrio Lda.',      'Revisão semestral'),
  ('Fornecedor OPI - Óleos Cutículas', 'fornecedor', 310.00, '2026-02-14', 'OPI Portugal',        '50 frascos óleo + 30 cremes'),
  ('Fornecedor CND - Vernizes Gel',    'fornecedor', 280.00, '2026-02-17', 'CND Shellac PT',      '20 cores novas colecção Primavera'),
  ('Google Ads - Campanha Fev',        'marketing',  180.00, '2026-02-18', 'Google Ireland Ltd.',  'Campanha pesquisa local'),
  ('Salário Leticia Silva',            'salario',   1200.00, '2026-02-25', 'Leticia Silva',       'Salário base Fevereiro'),
  ('Salário Ana Santos',               'salario',   1100.00, '2026-02-25', 'Ana Santos',          'Salário base Fevereiro'),
  ('Salário Carla Mendes',             'salario',   1150.00, '2026-02-25', 'Carla Mendes',        'Salário base Fevereiro'),
  ('Salário Rita Almeida',             'salario',    900.00, '2026-02-25', 'Rita Almeida',        'Salário base Fevereiro'),
  ('Contabilidade - Fevereiro',        'outros',     200.00, '2026-02-28', 'Contabilista Dr. Marques', 'Serviço mensal de contabilidade'),
  ('Material descartável',             'fornecedor', 95.00,  '2026-02-20', 'Makro Portugal',      'Luvas, máscaras, toalhitas');

-- === COMANDAS (Fev 2026) ===
INSERT INTO public.orders (client_name, total_amount, status, payment_method, notes, created_at) VALUES
  ('Maria Oliveira',  35.00,  'fechada','mbway','Manicure gel','2026-02-02 09:00:00+00'),
  ('Ana Pereira',     95.00,  'fechada','cartao','Nail art + pedicure','2026-02-02 10:30:00+00'),
  ('Cláudia Vieira',  70.00,  'fechada','cartao','Alongamento gel','2026-02-03 09:00:00+00'),
  ('Sofia Costa',     80.00,  'fechada','dinheiro','Manicure russa + produtos','2026-02-03 11:00:00+00'),
  ('Beatriz Santos',  40.00,  'fechada','mbway','Pedicure spa','2026-02-04 09:30:00+00'),
  ('Inês Rodrigues',  35.00,  'fechada','cartao','Manicure gel','2026-02-05 09:00:00+00'),
  ('Marta Ribeiro',   58.00,  'fechada','dinheiro','Verniz gel + óleo','2026-02-05 10:30:00+00'),
  ('Joana Ferreira',  45.00,  'fechada','mbway','Manicure russa','2026-02-06 09:00:00+00'),
  ('Carolina Lopes',  30.00,  'fechada','cartao','Nail art simples','2026-02-06 11:00:00+00'),
  ('Diana Martins',   85.00,  'fechada','mbway','Manicure gel + nail art','2026-02-09 09:00:00+00'),
  ('Maria Oliveira',  50.00,  'fechada','cartao','Pedicure gel','2026-02-09 10:30:00+00'),
  ('Ana Pereira',     65.00,  'fechada','cartao','Alongamento acrílico','2026-02-10 09:00:00+00'),
  ('Maria Oliveira',  35.00,  'aberta', NULL,'Manicure gel - em serviço','2026-02-28 09:00:00+00'),
  ('Ana Pereira',     40.00,  'aberta', NULL,'Pedicure spa','2026-02-28 09:30:00+00'),
  ('Cláudia Vieira',  55.00,  'aberta', NULL,'Nail art premium','2026-02-28 10:00:00+00');

-- === COMISSÕES (Fev 2026 - 4 semanas × 4 profissionais) ===
INSERT INTO public.commissions (member_name, amount, rate, date, status) VALUES
  -- Semana 1 (2-6 Fev)
  ('Leticia Silva',  56.00, 40, '2026-02-06', 'pago'),
  ('Ana Santos',     42.00, 35, '2026-02-06', 'pago'),
  ('Carla Mendes',   54.00, 40, '2026-02-06', 'pago'),
  ('Rita Almeida',   15.00, 30, '2026-02-06', 'pago'),
  -- Semana 2 (9-13 Fev)
  ('Leticia Silva',  62.00, 40, '2026-02-13', 'pago'),
  ('Ana Santos',     38.50, 35, '2026-02-13', 'pago'),
  ('Carla Mendes',   48.00, 40, '2026-02-13', 'pago'),
  ('Rita Almeida',   18.00, 30, '2026-02-13', 'pago'),
  -- Semana 3 (16-20 Fev)
  ('Leticia Silva',  52.00, 40, '2026-02-20', 'pago'),
  ('Ana Santos',     36.75, 35, '2026-02-20', 'pago'),
  ('Carla Mendes',   50.00, 40, '2026-02-20', 'pago'),
  ('Rita Almeida',   16.50, 30, '2026-02-20', 'pago'),
  -- Semana 4 (23-28 Fev)
  ('Leticia Silva',  44.00, 40, '2026-02-27', 'pendente'),
  ('Ana Santos',     31.50, 35, '2026-02-27', 'pendente'),
  ('Carla Mendes',   42.00, 40, '2026-02-27', 'pendente'),
  ('Rita Almeida',   13.50, 30, '2026-02-27', 'pendente');

-- === CAIXA - Fluxo completo Fev 2026 ===
INSERT INTO public.cash_register (type, amount, description, payment_method, date) VALUES
  -- Semana 1
  ('entrada', 275.00, 'Serviços dia 02/02', 'misto', '2026-02-02'),
  ('entrada', 160.00, 'Serviços dia 03/02', 'misto', '2026-02-03'),
  ('entrada', 155.00, 'Serviços dia 04/02', 'misto', '2026-02-04'),
  ('entrada', 175.00, 'Serviços dia 05/02', 'misto', '2026-02-05'),
  ('entrada', 160.00, 'Serviços dia 06/02', 'misto', '2026-02-06'),
  ('saida',  1500.00, 'Renda do Salão',      'transferencia', '2026-02-01'),
  ('saida',   155.00, 'Seguro do Salão',     'transferencia', '2026-02-01'),
  ('saida',    38.00, 'Internet Fibra',      'transferencia', '2026-02-03'),
  ('saida',   520.00, 'Fornecedor Moyra',    'transferencia', '2026-02-04'),
  ('saida',   243.00, 'Eletricidade + Água', 'transferencia', '2026-02-05'),
  ('saida',   145.00, 'Fornecedor Staleks',  'transferencia', '2026-02-06'),
  -- Semana 2
  ('entrada', 220.00, 'Serviços dia 09/02', 'misto', '2026-02-09'),
  ('entrada', 200.00, 'Serviços dia 10/02', 'misto', '2026-02-10'),
  ('entrada', 130.00, 'Serviços dia 11/02', 'misto', '2026-02-11'),
  ('entrada', 125.00, 'Serviços dia 12/02', 'misto', '2026-02-12'),
  ('entrada', 150.00, 'Serviços dia 13/02', 'misto', '2026-02-13'),
  ('saida',   250.00, 'Instagram Ads',      'cartao', '2026-02-07'),
  ('saida',    72.00, 'Produtos Limpeza',   'dinheiro', '2026-02-10'),
  ('saida',   190.00, 'Manutenção AC',      'transferencia', '2026-02-12'),
  -- Semana 3
  ('entrada', 165.00, 'Serviços dia 16/02', 'misto', '2026-02-16'),
  ('entrada', 145.00, 'Serviços dia 17/02', 'misto', '2026-02-17'),
  ('entrada', 140.00, 'Serviços dia 18/02', 'misto', '2026-02-18'),
  ('entrada', 115.00, 'Serviços dia 19/02', 'misto', '2026-02-19'),
  ('entrada', 100.00, 'Serviços dia 20/02', 'misto', '2026-02-20'),
  ('saida',   310.00, 'Fornecedor OPI',     'transferencia', '2026-02-14'),
  ('saida',   280.00, 'Fornecedor CND',     'transferencia', '2026-02-17'),
  ('saida',   180.00, 'Google Ads',         'cartao', '2026-02-18'),
  -- Semana 4
  ('entrada', 175.00, 'Serviços dia 23/02', 'misto', '2026-02-23'),
  ('entrada', 160.00, 'Serviços dia 24/02', 'misto', '2026-02-24'),
  ('entrada', 110.00, 'Serviços dia 25/02', 'misto', '2026-02-25'),
  ('saida',  4350.00, 'Salários Fevereiro', 'transferencia', '2026-02-25'),
  ('saida',    95.00, 'Material descartável','dinheiro', '2026-02-20'),
  ('saida',   200.00, 'Contabilidade',      'transferencia', '2026-02-28'),
  ('entrada', 130.00, 'Serviços dia 28/02 (parcial)', 'misto', '2026-02-28');

-- === METAS Fev 2026 ===
INSERT INTO public.goals (title, target_value, current_value, period, start_date, end_date, status) VALUES
  ('Faturação Mensal Fev',     5000.00, 4280.00, 'mensal',     '2026-02-01', '2026-02-28', 'ativa'),
  ('Novos Clientes Fev',         15.00,   12.00, 'mensal',     '2026-02-01', '2026-02-28', 'ativa'),
  ('Vendas Produtos Revenda',  1000.00,  720.00, 'mensal',     '2026-02-01', '2026-02-28', 'ativa'),
  ('Satisfação 5★ Google',       50.00,   42.00, 'trimestral', '2026-01-01', '2026-03-31', 'ativa'),
  ('Meta Anual Faturação',    60000.00, 9500.00, 'anual',      '2026-01-01', '2026-12-31', 'ativa');

-- === PACOTES ===
INSERT INTO public.plans (name, description, price, sessions, validity_days, services_included) VALUES
  ('Pacote Noiva',       'Preparação completa para o grande dia',      250.00, 5,  60, 'Manicure Gel, Pedicure Spa, Nail Art Premium, Tratamento Mãos'),
  ('Beauty Pass Mensal', 'Manutenção mensal com desconto',              90.00, 3,  30, 'Manicure Gel, Manutenção Gel'),
  ('Pacote Amiga VIP',   'Para 2 pessoas - ideal para amigas',        130.00, 4,  45, 'Manicure Gel x2, Pedicure Spa x2'),
  ('Fidelidade Premium', 'Programa anual com benefícios exclusivos',   800.00, 24, 365, 'Todos os serviços com 20% desconto');

-- === ANAMNESES ===
INSERT INTO public.anamnesis (client_name, allergies, medications, health_conditions, skin_type, nail_conditions, preferences, notes) VALUES
  ('Maria Oliveira',  'Alergia a acrilato',  'Nenhum',           'Saudável', 'Normal',   'Unhas fracas',  'Prefere cores neutras', 'Aplicar base fortalecedora sempre'),
  ('Ana Pereira',     'Nenhuma conhecida',   'Anti-histamínico', 'Rinite',   'Sensível', 'Normais',       'Gosta de nail art',     NULL),
  ('Cláudia Vieira',  'Nenhuma',             'Nenhum',           'Saudável', 'Mista',    'Onicofagia',    'Quer deixar de roer',   'Tratamento de reforço recomendado'),
  ('Sofia Costa',     'Sensível a acetona',  'Nenhum',           'Diabetes', 'Seca',     'Normais',       'Cores vibrantes',       'Usar removedor sem acetona'),
  ('Beatriz Santos',  'Nenhuma',             'Nenhum',           'Saudável', 'Normal',   'Normais',       'Estilo minimalista',    NULL),
  ('Inês Rodrigues',  'Nenhuma',             'Nenhum',           'Saudável', 'Normal',   'Estrias verticais', 'Verniz gel clássico', 'Aplicar tratamento anti-estrias'),
  ('Diana Martins',   'Alergia a latéx',     'Nenhum',           'Saudável', 'Sensível', 'Normais',       'Nail art artística',    'Usar luvas de nitrilo');

-- ✅ CONCLUÍDO! Fevereiro 2026 totalmente populado.
-- Total: 12 clientes, 12 serviços, 4 profissionais, 12 produtos
-- ~88 agendamentos, ~46 faturas, 19 despesas, 15 comandas
-- 16 comissões, 34 registos de caixa, 5 metas, 4 pacotes, 7 anamneses 
-- ==================  
-- 4. TABELA DE FATURAS (COMPRA/VENDA)  
-- ==================  
CREATE TABLE IF NOT EXISTS public.faturas (  
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  type TEXT NOT NULL DEFAULT 'venda', -- 'compra' ou 'venda'  
  description TEXT NOT NULL,  
  entity_name TEXT,  
  nif TEXT,  
  amount NUMERIC DEFAULT 0,  
  date DATE DEFAULT CURRENT_DATE,  
  status TEXT DEFAULT 'pago',  
  payment_method TEXT DEFAULT 'dinheiro',  
  attachment_url TEXT,  
  notes TEXT,  
  created_at TIMESTAMPTZ DEFAULT now()  
); 
