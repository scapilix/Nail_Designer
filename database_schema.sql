-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_spent NUMERIC DEFAULT 0,
  last_visit TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Produtos/Inventário
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  price NUMERIC DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Faturas / Vendas (invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pendente', -- 'pago', 'pendente', 'cancelado'
  payment_method TEXT DEFAULT 'Dinheiro', -- 'Dinheiro', 'MBWay', 'Multibanco'
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Itens da Fatura (invoice_items)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  service_id UUID,
  quantity INTEGER DEFAULT 1,
  price_at_time NUMERIC NOT NULL
);

-- Tabela de Despesas (expenses)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- DADOS DE EXEMPLO (SEED DATA)
-- Podes apagar ou manter se quiseres ter dados iniciais reais
-- ==========================================================

INSERT INTO public.clients (name, email, phone, total_spent, last_visit) VALUES
  ('Ana Sofia Marques', 'ana.sofia@email.com', '+351 912 345 678', 850.00, '2026-02-21 10:00:00'),
  ('Marta Ribeiro', 'marta.r@email.com', '+351 923 456 789', 320.00, '2026-02-20 15:30:00'),
  ('Joana Costa', 'joana.costa@email.com', '+351 934 567 890', 125.00, '2026-02-19 09:15:00'),
  ('Beatriz Santos', 'beatriz.s@email.com', '+351 965 678 901', 95.00, '2026-01-10 14:00:00')
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name, category, stock_quantity, price, total_sold) VALUES
  ('Gel de Construção Rosa', 'Stock', 15, 25.99, 42),
  ('Verniz Vermelho Paixão', 'Stock', 8, 12.50, 15),
  ('Creme Mãos Karité', 'Revenda', 30, 18.00, 120),
  ('Óleo de Cutículas', 'Revenda', 50, 9.50, 200)
ON CONFLICT DO NOTHING;

-- Gerar Faturas Simples para a Ana Sofia e Marta
INSERT INTO public.invoices (client_id, total_amount, status, payment_method, issue_date) 
SELECT id, 45.00, 'pago', 'MBWay', '2026-02-21 10:45:00' FROM public.clients WHERE name = 'Ana Sofia Marques';

INSERT INTO public.invoices (client_id, total_amount, status, payment_method, issue_date) 
SELECT id, 35.00, 'pendente', 'Dinheiro', '2026-02-20 16:00:00' FROM public.clients WHERE name = 'Marta Ribeiro';

INSERT INTO public.invoices (client_id, total_amount, status, payment_method, issue_date) 
SELECT id, 20.00, 'pago', 'Multibanco', '2026-02-19 10:00:00' FROM public.clients WHERE name = 'Joana Costa';

-- Despesas Fictícias deste mês
INSERT INTO public.expenses (description, category, amount, date) VALUES
  ('Renda do Salão', 'Fixa', 1500.00, '2026-02-01'),
  ('Eletricidade', 'Variável', 180.00, '2026-02-05'),
  ('Fornecedor Produtos Gel', 'Stock', 450.00, '2026-02-12'),
  ('Marketing (Meta Ads)', 'Variável', 300.00, '2026-02-15');
