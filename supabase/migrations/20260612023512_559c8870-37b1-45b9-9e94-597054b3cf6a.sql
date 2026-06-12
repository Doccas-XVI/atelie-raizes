DROP POLICY IF EXISTS "Autenticado lê fotos atelie" ON storage.objects;
CREATE POLICY "Admin lê fotos atelie"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(),'admin'));