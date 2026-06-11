
-- Storage policies
CREATE POLICY "Admin envia fotos atelie"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin atualiza fotos atelie"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admin remove fotos atelie"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Autenticado lê fotos atelie"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'atelie-fotos');

-- Primeiro usuário cadastrado vira admin
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();
