-- =============================================
-- TO BEAUTY ERP - COMPLETE DATABASE SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- Step 1: Creates all tables
-- Step 2: Adds columns to existing tables
-- Step 3: Sets up RLS policies
-- Step 4: Populates with sample data
-- =============================================

-- ==================
-- 1. CREATE TABLES
-- ==================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthday DATE,
  address TEXT,
  referral_source TEXT,
  notes TEXT,
  total_spent NUMERIC DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  duration INTEGER DEFAULT 30,
  price NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  commission_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  brand TEXT,
  stock_quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  price NUMERIC DEFAULT 0,
  cost_price NUMERIC DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  service_id UUID,
  team_member_id UUID,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  client_name TEXT,
  service_name TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pendente',
  payment_method TEXT DEFAULT 'dinheiro',
  date DATE,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  sessions INTEGER DEFAULT 1,
  validity_days INTEGER DEFAULT 30,
  services_included TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'aberta',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID,
  member_name TEXT,
  amount NUMERIC DEFAULT 0,
  rate NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cash_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  payment_method TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  period TEXT DEFAULT 'mensal',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID,
  client_name TEXT,
  allergies TEXT,
  medications TEXT,
  health_conditions TEXT,
  skin_type TEXT,
  nail_conditions TEXT,
  preferences TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key TEXT UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ==================
-- 2. ADD MISSING COLUMNS (safe to run multiple times)
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
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==================
-- 3. RLS POLICIES (allow all for development)
-- ==================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','services','team_members','products','bookings',
    'invoices','expenses','plans','orders','commissions',
    'cash_register','goals','anamnesis','site_images'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow all" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ==================
-- 4. SAMPLE DATA - Populates ALL tabs
-- ==================

-- === CLIENTES ===
INSERT INTO public.clients (name, email, phone, birthday, address, referral_source, total_spent, visit_count, last_visit) VALUES
  ('Maria Oliveira',   'maria.oliveira@email.com',   '912345678', '1990-05-15', 'Rua da Liberdade 45, Lisboa',     'Instagram',    450.00, 12, now() - interval '2 days'),
  ('Ana Pereira',      'ana.pereira@email.com',      '915555555', '1988-08-22', 'Av. da República 120, Lisboa',    'Indicação',    250.00,  8, now() - interval '5 days'),
  ('Cláudia Vieira',   'claudia.vieira@email.com',   '913333333', '1995-03-10', 'Rua Augusta 78, Lisboa',          'Google',       120.00,  5, now() - interval '3 days'),
  ('Sofia Costa',      'sofia.costa@email.com',      '916666666', '1992-11-28', 'Praça do Comércio 30, Lisboa',    'Facebook',      85.00,  3, now() - interval '7 days'),
  ('Beatriz Santos',   'beatriz.s@email.com',        '917777777', '1998-01-05', 'Rua de Santa Catarina 200, Porto','Amiga',         95.00,  4, now() - interval '1 day'),
  ('Inês Rodrigues',   'ines.r@email.com',           '918888888', '1993-07-19', 'Av. dos Aliados 50, Porto',       'Website',      320.00,  9, now() - interval '4 days'),
  ('Marta Ribeiro',    'marta.rib@email.com',        '919999999', '1985-12-03', 'Rua do Almada 15, Porto',         'Instagram',    180.00,  6, now() - interval '6 days'),
  ('Joana Ferreira',   'joana.f@email.com',          '911111111', '1997-04-25', 'Rua da Boavista 88, Porto',       'Indicação',     65.00,  2, now() - interval '10 days');

-- === SERVIÇOS ===
INSERT INTO public.services (name, category, duration, price, description) VALUES
  ('Manicure Clássica',       'Manicure',   45, 20.00, 'Manicure tradicional com corte, limar e esmaltado'),
  ('Manicure Gel',            'Manicure',   60, 35.00, 'Aplicação de verniz gel com duração até 3 semanas'),
  ('Manicure Russa',          'Manicure',   75, 45.00, 'Técnica russa com broca e cutícula perfeita'),
  ('Pedicure Spa',            'Pedicure',   75, 40.00, 'Pedicure completa com spa de pés e esfoliação'),
  ('Pedicure Gel',            'Pedicure',   90, 50.00, 'Pedicure com aplicação de verniz gel'),
  ('Nail Art Premium',        'Nail Art',   90, 55.00, 'Decoração artística personalizada'),
  ('Nail Art Simples',        'Nail Art',   60, 30.00, 'Decoração básica com 2-3 unhas destaque'),
  ('Alongamento Acrílico',    'Alongamento',120, 65.00, 'Extensão de unhas com acrílico'),
  ('Alongamento Gel',         'Alongamento',120, 70.00, 'Extensão de unhas com gel moldado'),
  ('Manutenção Gel',          'Manutenção',  60, 30.00, 'Preenchimento e manutenção de gel'),
  ('Remoção de Gel',          'Manutenção',  30, 15.00, 'Remoção segura de verniz gel ou acrílico'),
  ('Verniz Gel Premium',      'Manicure',   60, 40.00, 'Verniz gel com marcas premium importadas');

-- === PROFISSIONAIS ===
INSERT INTO public.team_members (name, role, phone, email, commission_rate) VALUES
  ('Leticia Silva',   'Nail Designer',    '+351 912 345 678', 'leticia@tobeauty.pt',   40),
  ('Ana Santos',      'Esteticista',      '+351 923 456 789', 'ana@tobeauty.pt',       35),
  ('Carla Mendes',    'Nail Designer',    '+351 934 567 890', 'carla@tobeauty.pt',     40),
  ('Rita Almeida',    'Manicure Junior',  '+351 945 678 901', 'rita@tobeauty.pt',      30);

-- === PRODUTOS ===
INSERT INTO public.products (name, category, brand, stock_quantity, min_stock, price, cost_price, total_sold) VALUES
  ('Gel de Construção Rosa',     'Material',  'Moyra',      15,  5, 25.99, 12.00,  42),
  ('Verniz Gel Vermelho Paixão', 'Material',  'CND Shellac', 8,  3, 12.50,  6.00,  87),
  ('Creme de Mãos Karité',      'Revenda',   'L''Occitane', 30, 10, 18.00,  8.50, 120),
  ('Óleo de Cutículas',          'Revenda',   'OPI',         50, 10,  9.50,  4.00, 200),
  ('Top Coat Brilhante',        'Material',  'Gelish',      12,  5, 15.00,  7.00,  65),
  ('Base Fortalecedora',         'Material',  'IBD',         20,  5, 14.00,  6.50,  55),
  ('Lima 180/240',               'Consumível','Staleks',    100, 20,  2.50,  0.80, 350),
  ('Removedor de Gel',           'Consumível','Moyra',       25, 10,  8.00,  3.50,  90),
  ('Kit Nail Art Pincéis',       'Ferramenta','Kolinsky',     5,  2, 45.00, 22.00,  15),
  ('Verniz Gel Nude Natural',    'Material',  'CND Shellac',  3,  5, 12.50,  6.00,  92),
  ('Acetona Pura 1L',            'Consumível','Quimivest',   10, 5,  6.00,  2.50,  40),
  ('Primer Ácido',               'Material',  'IBD',         18,  5, 11.00,  5.00,  30);

-- === AGENDAMENTOS (próximos dias) ===
INSERT INTO public.bookings (booking_date, booking_time, status, notes) VALUES
  (CURRENT_DATE, '09:00', 'confirmado', 'Cliente habitual'),
  (CURRENT_DATE, '09:30', 'confirmado', NULL),
  (CURRENT_DATE, '10:00', 'pendente', 'Primeira visita'),
  (CURRENT_DATE, '10:30', 'confirmado', NULL),
  (CURRENT_DATE, '11:00', 'confirmado', 'Pediu nail art especial'),
  (CURRENT_DATE, '14:00', 'pendente', NULL),
  (CURRENT_DATE, '14:30', 'confirmado', NULL),
  (CURRENT_DATE, '15:00', 'confirmado', 'Aniversário - fazer surpresa'),
  (CURRENT_DATE, '16:00', 'pendente', NULL),
  (CURRENT_DATE + 1, '09:00', 'pendente', NULL),
  (CURRENT_DATE + 1, '09:30', 'confirmado', NULL),
  (CURRENT_DATE + 1, '10:00', 'pendente', 'Quer alongamento'),
  (CURRENT_DATE + 1, '11:00', 'confirmado', NULL),
  (CURRENT_DATE + 1, '14:00', 'pendente', NULL),
  (CURRENT_DATE + 1, '15:30', 'confirmado', NULL),
  (CURRENT_DATE + 2, '09:00', 'pendente', NULL),
  (CURRENT_DATE + 2, '10:00', 'pendente', NULL),
  (CURRENT_DATE + 2, '14:00', 'confirmado', NULL),
  (CURRENT_DATE - 1, '09:00', 'concluido', 'Manicure russa feita'),
  (CURRENT_DATE - 1, '10:30', 'concluido', NULL),
  (CURRENT_DATE - 1, '14:00', 'concluido', 'Gostou muito do resultado'),
  (CURRENT_DATE - 2, '09:00', 'concluido', NULL),
  (CURRENT_DATE - 2, '11:00', 'cancelado', 'Cliente cancelou por doença'),
  (CURRENT_DATE - 3, '10:00', 'concluido', NULL);

-- === TRANSAÇÕES / FATURAS ===
INSERT INTO public.invoices (client_name, service_name, total_amount, status, payment_method, date) VALUES
  ('Maria Oliveira',  'Manicure Gel',           35.00, 'pago',     'mbway',         CURRENT_DATE - 1),
  ('Ana Pereira',     'Manicure Russa + Gel',   80.00, 'pago',     'cartao',        CURRENT_DATE - 1),
  ('Cláudia Vieira',  'Pedicure Spa',           40.00, 'pago',     'dinheiro',      CURRENT_DATE - 2),
  ('Sofia Costa',     'Nail Art Premium',       55.00, 'pendente', 'mbway',         CURRENT_DATE - 2),
  ('Beatriz Santos',  'Manicure Clássica',      20.00, 'pago',     'dinheiro',      CURRENT_DATE - 3),
  ('Inês Rodrigues',  'Alongamento Gel',        70.00, 'pago',     'cartao',        CURRENT_DATE - 3),
  ('Marta Ribeiro',   'Verniz Gel Premium',     40.00, 'pago',     'mbway',         CURRENT_DATE - 4),
  ('Joana Ferreira',  'Remoção de Gel',         15.00, 'pago',     'dinheiro',      CURRENT_DATE - 5),
  ('Maria Oliveira',  'Pedicure Gel',           50.00, 'pago',     'cartao',        CURRENT_DATE - 6),
  ('Ana Pereira',     'Manutenção Gel',         30.00, 'pago',     'mbway',         CURRENT_DATE - 7),
  ('Cláudia Vieira',  'Manicure Gel + Nail Art',85.00, 'pago',     'cartao',        CURRENT_DATE - 8),
  ('Beatriz Santos',  'Manicure Russa',         45.00, 'cancelado','dinheiro',      CURRENT_DATE - 9);

-- === DESPESAS ===
INSERT INTO public.expenses (description, category, amount, date, notes) VALUES
  ('Renda do Salão - Fevereiro',      'aluguel',     1500.00, CURRENT_DATE - 25, 'Pagamento mensal'),
  ('Eletricidade',                     'utility',      180.00, CURRENT_DATE - 20, NULL),
  ('Água',                             'utility',       45.00, CURRENT_DATE - 20, NULL),
  ('Internet Fibra',                   'utility',       35.00, CURRENT_DATE - 18, NULL),
  ('Fornecedor Moyra - Géis',          'fornecedor',   450.00, CURRENT_DATE - 15, 'Encomenda trimestral'),
  ('Fornecedor Staleks - Limas',       'fornecedor',   120.00, CURRENT_DATE - 12, NULL),
  ('Marketing Instagram Ads',          'marketing',    200.00, CURRENT_DATE - 10, 'Campanha Fevereiro'),
  ('Seguro do Salão',                  'outros',       150.00, CURRENT_DATE - 8,  'Seguro anual'),
  ('Produtos de Limpeza',              'fornecedor',    65.00, CURRENT_DATE - 5,  NULL),
  ('Manutenção Ar Condicionado',       'outros',       180.00, CURRENT_DATE - 3,  'Revisão semestral'),
  ('Fornecedor OPI - Óleos',           'fornecedor',   280.00, CURRENT_DATE - 1,  NULL);

-- === PACOTES ===
INSERT INTO public.plans (name, description, price, sessions, validity_days, services_included) VALUES
  ('Pacote Noiva',        'Preparação completa para o grande dia',    250.00, 5,  60, 'Manicure Gel, Pedicure Spa, Nail Art Premium, Tratamento Mãos'),
  ('Beauty Pass Mensal',  'Manutenção mensal com desconto',           90.00,  3,  30, 'Manicure Gel, Manutenção Gel'),
  ('Pacote Amiga VIP',    'Para 2 pessoas - ideal para amigas',      130.00,  4,  45, 'Manicure Gel x2, Pedicure Spa x2'),
  ('Fidelidade Premium',  'Programa anual com benefícios exclusivos', 800.00, 24, 365, 'Todos os serviços com 20% desconto');

-- === COMANDAS ===
INSERT INTO public.orders (client_name, total_amount, status, payment_method, notes) VALUES
  ('Maria Oliveira',  35.00, 'fechada',   'mbway',     'Manicure gel feita'),
  ('Ana Pereira',     80.00, 'fechada',   'cartao',    'Manicure russa + pedicure'),
  ('Cláudia Vieira',  40.00, 'aberta',    NULL,        'Em atendimento'),
  ('Sofia Costa',     55.00, 'aberta',    NULL,        'A aguardar nail art'),
  ('Beatriz Santos',  20.00, 'fechada',   'dinheiro',  NULL),
  ('Inês Rodrigues',  70.00, 'cancelada', NULL,        'Cancelou por conflito de horário');

-- === COMISSÕES ===
INSERT INTO public.commissions (member_name, amount, rate, date, status) VALUES
  ('Leticia Silva',  14.00, 40, CURRENT_DATE - 1, 'pago'),
  ('Leticia Silva',  32.00, 40, CURRENT_DATE - 1, 'pago'),
  ('Ana Santos',     14.00, 35, CURRENT_DATE - 2, 'pendente'),
  ('Carla Mendes',   22.00, 40, CURRENT_DATE - 2, 'pendente'),
  ('Rita Almeida',    6.00, 30, CURRENT_DATE - 3, 'pago'),
  ('Leticia Silva',  28.00, 40, CURRENT_DATE - 3, 'pago'),
  ('Ana Santos',     17.50, 35, CURRENT_DATE - 4, 'pendente'),
  ('Carla Mendes',   20.00, 40, CURRENT_DATE - 5, 'pago');

-- === CAIXA ===
INSERT INTO public.cash_register (type, amount, description, payment_method, date) VALUES
  ('entrada', 35.00, 'Manicure Gel - Maria Oliveira',   'mbway',     CURRENT_DATE - 1),
  ('entrada', 80.00, 'Manicure Russa + Gel - Ana P.',   'cartao',    CURRENT_DATE - 1),
  ('saida',   65.00, 'Produtos de Limpeza',             'dinheiro',  CURRENT_DATE - 1),
  ('entrada', 40.00, 'Pedicure Spa - Cláudia V.',       'dinheiro',  CURRENT_DATE - 2),
  ('entrada', 55.00, 'Nail Art Premium - Sofia C.',     'mbway',     CURRENT_DATE - 2),
  ('saida',  180.00, 'Eletricidade',                    'transferencia', CURRENT_DATE - 3),
  ('entrada', 20.00, 'Manicure Clássica - Beatriz S.',  'dinheiro',  CURRENT_DATE - 3),
  ('entrada', 70.00, 'Alongamento Gel - Inês R.',       'cartao',    CURRENT_DATE - 3),
  ('saida',  450.00, 'Encomenda Fornecedor Moyra',      'transferencia', CURRENT_DATE - 5),
  ('entrada', 50.00, 'Pedicure Gel - Maria O.',         'cartao',    CURRENT_DATE - 6);

-- === METAS ===
INSERT INTO public.goals (title, target_value, current_value, period, status) VALUES
  ('Faturação Mensal',           5000.00, 3250.00, 'mensal',     'ativa'),
  ('Novos Clientes',              20.00,   12.00, 'mensal',     'ativa'),
  ('Vendas Produtos Revenda',    1000.00,  650.00, 'mensal',     'ativa'),
  ('Satisfação Clientes 5★',      50.00,   42.00, 'trimestral', 'ativa'),
  ('Meta Anual Faturação',      60000.00,28000.00, 'anual',      'ativa');

-- === ANAMNESES ===
INSERT INTO public.anamnesis (client_name, allergies, medications, health_conditions, skin_type, nail_conditions, preferences, notes) VALUES
  ('Maria Oliveira',  'Alergia a acrilato',    'Nenhum',           'Saudável', 'Normal',   'Unhas fracas', 'Prefere cores neutras', 'Aplicar base fortalecedora sempre'),
  ('Ana Pereira',     'Nenhuma conhecida',     'Anti-histamínico', 'Rinite',   'Sensível', 'Normais',      'Gosta de nail art',     NULL),
  ('Cláudia Vieira',  'Nenhuma',               'Nenhum',           'Saudável', 'Mista',    'Onicofagia',   'Quer parar de roer',    'Tratamento de reforço recomendado'),
  ('Sofia Costa',     'Sensível a acetona',    'Nenhum',           'Diabetes', 'Seca',     'Normais',      'Cores vibrantes',       'Usar removedor sem acetona'),
  ('Beatriz Santos',  'Nenhuma',               'Nenhum',           'Saudável', 'Normal',   'Normais',      'Estilo minimalista',    NULL);

-- ✅ DONE! All tables populated with sample data.