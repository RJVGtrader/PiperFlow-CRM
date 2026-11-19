-- =============================================================================
-- Endurecimento das policies do schema inicial (review do M8)
--
-- 1. Helpers de autorização saem do schema public (exposto pela API como RPC)
--    para o schema private: continuam usáveis pelas policies, mas ninguém mais
--    consegue chamá-los para sondar quem é membro de qual workspace.
-- 2. Atividade: autor não pode ser trocado por quem não é admin.
-- 3. profiles.email só muda junto com o e-mail do Auth (não pela API).
-- 4. Entrada em workspace só por create_workspace() ou aceite de convite (M9):
--    admin não insere usuário arbitrário em workspace_members.
-- =============================================================================

-- 1. Helpers em schema não exposto ------------------------------------------

create schema if not exists private;
grant usage on schema private to authenticated;

-- ALTER ... SET SCHEMA preserva o OID, então as policies existentes continuam
-- apontando para as mesmas funções.
alter function public.is_member_of(uuid, uuid) set schema private;
alter function public.is_workspace_member(uuid) set schema private;
alter function public.is_workspace_admin(uuid) set schema private;
alter function public.shares_workspace_with(uuid) set schema private;

-- O corpo (SQL) referencia is_member_of pelo nome: atualiza para o novo schema.
create or replace function private.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_member_of(target_workspace, (select auth.uid()));
$$;

grant execute on function private.is_member_of(uuid, uuid) to authenticated;
grant execute on function private.is_workspace_member(uuid) to authenticated;
grant execute on function private.is_workspace_admin(uuid) to authenticated;
grant execute on function private.shares_workspace_with(uuid) to authenticated;

-- 2. Autor da atividade ------------------------------------------------------

drop policy "activities: autor ou admin edita" on public.activities;

create policy "activities: autor ou admin edita"
  on public.activities for update to authenticated
  using (
    private.is_workspace_member(workspace_id)
    and (author_id = (select auth.uid()) or private.is_workspace_admin(workspace_id))
  )
  with check (
    private.is_workspace_member(workspace_id)
    and (author_id = (select auth.uid()) or private.is_workspace_admin(workspace_id))
  );

-- 3. E-mail do profile -------------------------------------------------------

revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

revoke execute on function public.handle_user_email_change() from public, anon, authenticated;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- 4. Entrada em workspace ----------------------------------------------------

drop policy "workspace_members: admins adicionam" on public.workspace_members;
