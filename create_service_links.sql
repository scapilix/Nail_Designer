-- ========================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- Associa profissionais aos serviços
-- ========================================

-- 1. Criar tabela de associação profissional-serviço
CREATE TABLE IF NOT EXISTS public.team_member_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_member_id, service_id)
);

-- 2. RLS
ALTER TABLE public.team_member_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.team_member_services;
CREATE POLICY "Allow all" ON public.team_member_services FOR ALL USING (true) WITH CHECK (true);

-- 3. Associar profissionais aos serviços
--    Letícia Silva: Especialista em tudo (Nail Designer Sénior)
--    Ana Santos: Esteticista (pedicures, manicures clássicas, manutenção)
--    Carla Mendes: Nail Designer (gel, nail art, alongamentos)

INSERT INTO public.team_member_services (team_member_id, service_id)
SELECT tm.id, s.id
FROM public.team_members tm
CROSS JOIN public.services s
WHERE tm.name = 'Letícia Silva';
-- Letícia faz TODOS os serviços

INSERT INTO public.team_member_services (team_member_id, service_id)
SELECT tm.id, s.id
FROM public.team_members tm, public.services s
WHERE tm.name = 'Ana Santos'
AND s.name IN (
  'Manicure Clássica', 'Pedicure Spa', 'Pedicure Gel',
  'Manutenção Gel', 'Remoção de Gel', 'Manicure Russa'
);

INSERT INTO public.team_member_services (team_member_id, service_id)
SELECT tm.id, s.id
FROM public.team_members tm, public.services s
WHERE tm.name = 'Carla Mendes'
AND s.name IN (
  'Manicure Gel', 'Nail Art Premium', 'Nail Art Simples',
  'Alongamento Acrílico', 'Alongamento Gel', 'Verniz Gel Premium',
  'Manicure Russa', 'Manutenção Gel'
);
