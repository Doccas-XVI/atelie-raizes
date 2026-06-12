
-- Fix: grant execute so the client can call has_role via RPC
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- Allow admins to list user_roles (for management UI)
CREATE POLICY "Admins veem todos os papéis"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function: list users with their admin status (admin-only)
CREATE OR REPLACE FUNCTION public.list_admins()
RETURNS TABLE(user_id uuid, email text, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, EXISTS(
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = u.id AND ur.role = 'admin'
  )
  FROM auth.users u
  ORDER BY u.created_at;
END;
$$;
GRANT EXECUTE ON FUNCTION public.list_admins() TO authenticated;

-- Function: promote user to admin by email (admin-only)
CREATE OR REPLACE FUNCTION public.promote_admin_by_email(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT id INTO target_id FROM auth.users WHERE email = lower(trim(_email));
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado. O email precisa estar cadastrado em /auth.';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (target_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
GRANT EXECUTE ON FUNCTION public.promote_admin_by_email(text) TO authenticated;

-- Function: revoke admin from a user (admin-only). Pelo menos 1 admin sempre.
CREATE OR REPLACE FUNCTION public.revoke_admin(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT count(*) INTO total FROM public.user_roles WHERE role = 'admin';
  IF total <= 1 THEN
    RAISE EXCEPTION 'Não é possível remover o último admin do ateliê.';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
END;
$$;
GRANT EXECUTE ON FUNCTION public.revoke_admin(uuid) TO authenticated;
