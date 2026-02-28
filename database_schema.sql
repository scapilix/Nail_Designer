-- =============================================
-- COMPLETE DATABASE SCHEMA FOR TO BEAUTY ERP
-- Run this in Supabase SQL Editor
-- =============================================

-- Services table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  duration INTEGER DEFAULT 30,
  price NUMERIC DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Team members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  commission_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Plans/Packages table
CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  sessions INTEGER DEFAULT 1,
  validity_days INTEGER DEFAULT 30,
  services_included TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Orders/Comandas table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'aberta',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0
);

-- Commissions table
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  member_name TEXT,
  order_id UUID,
  amount NUMERIC DEFAULT 0,
  rate NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Cash register table
CREATE TABLE IF NOT EXISTS public.cash_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  payment_method TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  period TEXT DEFAULT 'mensal',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Anamnesis table
CREATE TABLE IF NOT EXISTS public.anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  client_name TEXT,
  allergies TEXT,
  medications TEXT,
  health_conditions TEXT,
  skin_type TEXT,
  nail_conditions TEXT,
  preferences TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- Add missing columns to existing tables
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

-- RLS Policies (allow all for development)
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['services','team_members','bookings','plans','orders','order_items','commissions','cash_register','goals','anamnesis'])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow all" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Seed data
INSERT INTO public.services (name, category, duration, price) VALUES
  ('Manicure Clássica', 'Manicure', 45, 20.00),
  ('Manicure Gel', 'Manicure', 60, 35.00),
  ('Pedicure Spa', 'Pedicure', 75, 40.00),
  ('Nail Art Premium', 'Nail Art', 90, 55.00),
  ('Remoção de Gel', 'Manutenção', 30, 15.00)
ON CONFLICT DO NOTHING;

INSERT INTO public.team_members (name, role, phone, commission_rate) VALUES
  ('Leticia Silva', 'Nail Designer', '+351 912 345 678', 40),
  ('Ana Santos', 'Esteticista', '+351 923 456 789', 35)
ON CONFLICT DO NOTHING;
