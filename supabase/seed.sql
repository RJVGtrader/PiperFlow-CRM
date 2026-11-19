-- =============================================================================
-- Seed de desenvolvimento/staging — PipeFlow CRM
--
-- NUNCA rodar em produção: cria usuários de teste com senha conhecida.
-- Espelha os dados mock da fase de UI (lib/mock-data.ts):
--   * Acme Vendas (Pro): Ana e Bruna (admins), Carlos e Rafael (membros),
--     14 leads, 20 negócios, 14 atividades e 1 convite pendente.
--   * Agência Nova (Free, no limite de 2 colaboradores): Ana (admin) e Pedro
--     (membro), com poucos dados próprios — útil para testar o isolamento.
--
-- Login de todos os usuários de teste: <e-mail abaixo> / senha pipeflow123
-- Prazos de negócios são relativos a current_date, como nos mocks.
-- Idempotente: pode rodar de novo sem duplicar (on conflict do nothing).
-- =============================================================================

-- Usuários (Supabase Auth). O trigger on_auth_user_created cria os profiles.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, phone_change, phone_change_token, reauthentication_token
)
select
  '00000000-0000-0000-0000-000000000000', u.id::uuid, 'authenticated', 'authenticated', u.email,
  extensions.crypt('pipeflow123', extensions.gen_salt('bf')), now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  jsonb_build_object('full_name', u.full_name), now(), now(),
  '', '', '', '', '', '', '', ''
from (values
  ('00000000-0000-4000-a000-000000000001', 'ana@acmevendas.com', 'Ana Souza'),
  ('00000000-0000-4000-a000-000000000002', 'carlos@acmevendas.com', 'Carlos Mendes'),
  ('00000000-0000-4000-a000-000000000003', 'bruna@acmevendas.com', 'Bruna Ferreira'),
  ('00000000-0000-4000-a000-000000000004', 'rafael@acmevendas.com', 'Rafael Duarte'),
  ('00000000-0000-4000-a000-000000000005', 'pedro@agencianova.com.br', 'Pedro Lima')
) as u (id, email, full_name)
on conflict (id) do nothing;

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.id::text like '00000000-0000-4000-a000-%'
on conflict (provider_id, provider) do nothing;

-- Workspaces
insert into public.workspaces (id, name, created_by, created_at) values
  ('10000000-0000-4000-a000-000000000001', 'Acme Vendas', '00000000-0000-4000-a000-000000000001', '2026-03-02'),
  ('10000000-0000-4000-a000-000000000002', 'Agência Nova', '00000000-0000-4000-a000-000000000001', '2026-06-21')
on conflict (id) do nothing;

insert into public.workspace_members (id, workspace_id, user_id, role, created_at) values
  ('50000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000001', 'admin', '2026-03-02'),
  ('50000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000002', 'membro', '2026-03-10'),
  ('50000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000003', 'admin', '2026-04-18'),
  ('50000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001', '00000000-0000-4000-a000-000000000004', 'membro', '2026-09-05'),
  ('50000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000001', 'admin', '2026-06-21'),
  ('50000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000002', '00000000-0000-4000-a000-000000000005', 'membro', '2026-07-03')
on conflict (id) do nothing;

insert into public.workspace_invites (id, workspace_id, email, role, invited_by, created_at, expires_at) values
  ('60000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', 'juliana@acmevendas.com', 'membro', '00000000-0000-4000-a000-000000000001', current_date - 2, current_date + 5)
on conflict (id) do nothing;

-- Assinaturas: Acme no Pro (sem IDs reais do Stripe até o M13), Nova no Free.
insert into public.subscriptions (workspace_id, plan, status, current_period_end) values
  ('10000000-0000-4000-a000-000000000001', 'pro', 'active', current_date + 23),
  ('10000000-0000-4000-a000-000000000002', 'free', 'active', null)
on conflict (workspace_id) do nothing;

-- Leads da Acme Vendas
insert into public.leads (
  id, workspace_id, name, email, phone, company, job_title, status, owner_id, created_at
) values
  ('20000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', 'Mariana Costa', 'mariana.costa@grupovialog.com.br', '(11) 98765-4321', 'Grupo Vialog', 'Gerente de Compras', 'qualificado', '00000000-0000-4000-a000-000000000001', '2026-06-02'),
  ('20000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', 'Rafael Almeida', 'rafael@almeidaadvocacia.com.br', '(21) 99887-1234', 'Almeida Advocacia', 'Sócio', 'novo', '00000000-0000-4000-a000-000000000002', '2026-07-28'),
  ('20000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', 'Juliana Pereira', 'juliana.pereira@nordestetech.com', '(81) 98123-4567', 'Nordeste Tech', 'CTO', 'contatado', '00000000-0000-4000-a000-000000000003', '2026-07-18'),
  ('20000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001', 'Eduardo Santos', 'eduardo@santosimoveis.com.br', '(31) 99456-7890', 'Santos Imóveis', 'Diretor Comercial', 'desqualificado', '00000000-0000-4000-a000-000000000001', '2026-05-20'),
  ('20000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000001', 'Camila Rodrigues', 'camila.rodrigues@bellamoda.com.br', '(11) 97654-3210', 'Bella Moda', 'Fundadora', 'qualificado', '00000000-0000-4000-a000-000000000002', '2026-06-25'),
  ('20000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000001', 'Thiago Oliveira', 'thiago@oliveiralog.com', '(41) 98234-5678', 'Oliveira Logística', 'Gerente de TI', 'novo', '00000000-0000-4000-a000-000000000003', '2026-07-29'),
  ('20000000-0000-4000-a000-000000000007', '10000000-0000-4000-a000-000000000001', 'Fernanda Lima', 'fernanda.lima@clinicavitta.com.br', '(19) 99345-6789', 'Clínica Vitta', 'Administradora', 'contatado', '00000000-0000-4000-a000-000000000001', '2026-07-10'),
  ('20000000-0000-4000-a000-000000000008', '10000000-0000-4000-a000-000000000001', 'Bruno Carvalho', 'bruno@carvalhoconsult.com.br', '(48) 98456-7891', 'Carvalho Consultoria', 'Consultor Sênior', 'novo', '00000000-0000-4000-a000-000000000002', '2026-07-27'),
  ('20000000-0000-4000-a000-000000000009', '10000000-0000-4000-a000-000000000001', 'Patrícia Gomes', 'patricia.gomes@ecosolar.com.br', '(85) 99567-8912', 'EcoSolar Energia', 'Gerente de Vendas', 'qualificado', '00000000-0000-4000-a000-000000000003', '2026-06-18'),
  ('20000000-0000-4000-a000-000000000010', '10000000-0000-4000-a000-000000000001', 'Lucas Martins', 'lucas.martins@martinsagro.com.br', '(62) 98678-9123', 'Martins Agro', 'Proprietário', 'contatado', '00000000-0000-4000-a000-000000000001', '2026-07-14'),
  ('20000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000001', 'Vanessa Ribeiro', 'vanessa@ribeiroeducacional.com.br', '(51) 99789-1234', 'Ribeiro Educacional', 'Diretora Pedagógica', 'desqualificado', '00000000-0000-4000-a000-000000000002', '2026-05-30'),
  ('20000000-0000-4000-a000-000000000012', '10000000-0000-4000-a000-000000000001', 'Gabriel Souza', 'gabriel.souza@techflowbr.com', '(11) 98890-1235', 'TechFlow BR', 'Head de Produto', 'novo', '00000000-0000-4000-a000-000000000003', '2026-07-30'),
  ('20000000-0000-4000-a000-000000000013', '10000000-0000-4000-a000-000000000001', 'Diego Martins', 'diego.martins@martinscontabil.com.br', '(31) 98234-1290', 'Martins Contábil', 'Sócio-Diretor', 'qualificado', '00000000-0000-4000-a000-000000000003', '2026-07-05'),
  ('20000000-0000-4000-a000-000000000014', '10000000-0000-4000-a000-000000000001', 'Beatriz Fontes', 'beatriz.fontes@fontesarquitetura.com.br', '(21) 99345-6721', 'Fontes Arquitetura', 'Diretora', 'contatado', '00000000-0000-4000-a000-000000000001', '2026-07-12')
on conflict (id) do nothing;

-- Leads da Agência Nova (só visíveis para Ana e Pedro)
insert into public.leads (
  id, workspace_id, name, email, phone, company, job_title, status, owner_id, created_at
) values
  ('20000000-0000-4000-a000-000000000101', '10000000-0000-4000-a000-000000000002', 'Larissa Moura', 'larissa@cafeteriamoura.com.br', '(11) 98111-2233', 'Cafeteria Moura', 'Proprietária', 'qualificado', '00000000-0000-4000-a000-000000000005', '2026-07-10'),
  ('20000000-0000-4000-a000-000000000102', '10000000-0000-4000-a000-000000000002', 'Gustavo Prado', 'gustavo@pradofit.com.br', '(11) 97222-3344', 'Prado Fit', 'Sócio', 'novo', '00000000-0000-4000-a000-000000000001', '2026-08-01')
on conflict (id) do nothing;

-- Negócios da Acme Vendas
insert into public.deals (id, workspace_id, lead_id, title, value, stage, owner_id, due_date) values
  ('30000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'Licenças CRM — Grupo Vialog', 18000, 'novo_lead', '00000000-0000-4000-a000-000000000001', current_date + 5),
  ('30000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 'Consultoria comercial — Almeida Advocacia', 6500, 'novo_lead', '00000000-0000-4000-a000-000000000002', current_date + 12),
  ('30000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000012', 'Plano Pro anual — TechFlow BR', 24000, 'novo_lead', '00000000-0000-4000-a000-000000000003', current_date + 6),
  ('30000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003', 'Implantação CRM — Nordeste Tech', 32000, 'contato_realizado', '00000000-0000-4000-a000-000000000003', current_date + 15),
  ('30000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000006', 'Upgrade de plano — Oliveira Logística', 9800, 'contato_realizado', '00000000-0000-4000-a000-000000000003', current_date - 1),
  ('30000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000008', 'Onboarding equipe comercial — Carvalho Consultoria', 5200, 'contato_realizado', '00000000-0000-4000-a000-000000000002', current_date + 20),
  ('30000000-0000-4000-a000-000000000007', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005', 'Proposta plano Pro — Bella Moda', 14500, 'proposta_enviada', '00000000-0000-4000-a000-000000000002', current_date + 3),
  ('30000000-0000-4000-a000-000000000008', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000009', 'Expansão de licenças — EcoSolar Energia', 21000, 'proposta_enviada', '00000000-0000-4000-a000-000000000003', current_date + 4),
  ('30000000-0000-4000-a000-000000000009', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000007', 'Contrato anual — Clínica Vitta', 16800, 'negociacao', '00000000-0000-4000-a000-000000000001', current_date - 2),
  ('30000000-0000-4000-a000-000000000010', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000010', 'Migração de planilhas — Martins Agro', 12300, 'negociacao', '00000000-0000-4000-a000-000000000001', current_date + 0),
  ('30000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'Plano Pro 12 meses — Grupo Vialog', 27500, 'fechado_ganho', '00000000-0000-4000-a000-000000000001', current_date - 12),
  ('30000000-0000-4000-a000-000000000012', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005', 'Renovação anual — Bella Moda', 15000, 'fechado_ganho', '00000000-0000-4000-a000-000000000002', current_date - 25),
  ('30000000-0000-4000-a000-000000000013', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000011', 'Plano Free → Pro — Ribeiro Educacional', 7200, 'fechado_perdido', '00000000-0000-4000-a000-000000000002', current_date - 30),
  ('30000000-0000-4000-a000-000000000014', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000004', 'Licenças equipe — Santos Imóveis', 11400, 'fechado_perdido', '00000000-0000-4000-a000-000000000001', current_date - 38),
  ('30000000-0000-4000-a000-000000000015', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000013', 'Proposta plano Pro — Martins Contábil', 9600, 'proposta_enviada', '00000000-0000-4000-a000-000000000003', current_date + 8),
  ('30000000-0000-4000-a000-000000000016', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000014', 'Contrato semestral — Fontes Arquitetura', 13400, 'negociacao', '00000000-0000-4000-a000-000000000001', current_date + 2),
  ('30000000-0000-4000-a000-000000000017', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003', 'Upgrade de licenças — Nordeste Tech', 19800, 'fechado_ganho', '00000000-0000-4000-a000-000000000003', current_date - 18),
  ('30000000-0000-4000-a000-000000000018', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000009', 'Plano Pro anual — EcoSolar Energia', 15600, 'fechado_perdido', '00000000-0000-4000-a000-000000000003', current_date - 21),
  ('30000000-0000-4000-a000-000000000019', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000002', 'Treinamento de equipe — Almeida Advocacia', 8900, 'proposta_enviada', '00000000-0000-4000-a000-000000000001', current_date + 9),
  ('30000000-0000-4000-a000-000000000020', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000006', 'Plano Pro semestral — Oliveira Logística', 11200, 'contato_realizado', '00000000-0000-4000-a000-000000000001', current_date + 1)
on conflict (id) do nothing;

-- Negócio da Agência Nova
insert into public.deals (id, workspace_id, lead_id, title, value, stage, owner_id, due_date) values
  ('30000000-0000-4000-a000-000000000101', '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000101', 'Identidade visual — Cafeteria Moura', 4800, 'proposta_enviada', '00000000-0000-4000-a000-000000000005', current_date + 4)
on conflict (id) do nothing;

-- Atividades da Acme Vendas
insert into public.activities (id, workspace_id, lead_id, type, description, author_id, occurred_at) values
  ('40000000-0000-4000-a000-000000000001', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'email', 'Enviado e-mail de apresentação com o catálogo de planos.', '00000000-0000-4000-a000-000000000001', '2026-06-03 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000002', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'ligacao', 'Ligação de descoberta. Mariana confirmou orçamento aprovado para o trimestre.', '00000000-0000-4000-a000-000000000001', '2026-06-10 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000003', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'reuniao', 'Reunião de demonstração do produto com a equipe de compras.', '00000000-0000-4000-a000-000000000001', '2026-06-20 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000004', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000001', 'nota', 'Lead qualificado — avançar proposta comercial na próxima semana.', '00000000-0000-4000-a000-000000000001', '2026-07-05 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000005', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003', 'email', 'Enviado e-mail com respostas técnicas sobre integração via API.', '00000000-0000-4000-a000-000000000003', '2026-07-19 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000006', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000003', 'ligacao', 'Ligação de alinhamento com o time técnico da Nordeste Tech.', '00000000-0000-4000-a000-000000000003', '2026-07-22 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000007', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005', 'email', 'Primeiro contato por e-mail após indicação de cliente atual.', '00000000-0000-4000-a000-000000000002', '2026-06-26 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000008', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005', 'reuniao', 'Reunião de apresentação do produto via videochamada.', '00000000-0000-4000-a000-000000000002', '2026-07-02 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000009', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000005', 'nota', 'Camila pediu proposta com desconto para pagamento anual.', '00000000-0000-4000-a000-000000000002', '2026-07-15 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000010', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000007', 'ligacao', 'Ligação inicial. Fernanda demonstrou interesse em automatizar o funil de vendas.', '00000000-0000-4000-a000-000000000001', '2026-07-11 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000011', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000007', 'email', 'Envio de material comparativo entre planos Free e Pro.', '00000000-0000-4000-a000-000000000001', '2026-07-16 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000012', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000010', 'email', 'E-mail de apresentação enviado após contato via formulário do site.', '00000000-0000-4000-a000-000000000001', '2026-07-15 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000013', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000010', 'ligacao', 'Ligação de qualificação. Lucas busca substituir controle em planilhas.', '00000000-0000-4000-a000-000000000001', '2026-07-20 10:00:00-03'),
  ('40000000-0000-4000-a000-000000000014', '10000000-0000-4000-a000-000000000001', '20000000-0000-4000-a000-000000000010', 'reuniao', 'Reunião de demonstração agendada com o time da fazenda.', '00000000-0000-4000-a000-000000000001', '2026-07-25 10:00:00-03')
on conflict (id) do nothing;

-- Atividade da Agência Nova
insert into public.activities (id, workspace_id, lead_id, type, description, author_id, occurred_at) values
  ('40000000-0000-4000-a000-000000000101', '10000000-0000-4000-a000-000000000002', '20000000-0000-4000-a000-000000000101', 'reuniao', 'Briefing inicial da nova identidade visual.', '00000000-0000-4000-a000-000000000005', '2026-07-12 15:00:00-03')
on conflict (id) do nothing;
