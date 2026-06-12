
-- Allow public read of objects in atelie-fotos bucket, and admin write
DROP POLICY IF EXISTS "atelie_fotos_public_read" ON storage.objects;
CREATE POLICY "atelie_fotos_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'atelie-fotos');

DROP POLICY IF EXISTS "atelie_fotos_admin_insert" ON storage.objects;
CREATE POLICY "atelie_fotos_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "atelie_fotos_admin_update" ON storage.objects;
CREATE POLICY "atelie_fotos_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "atelie_fotos_admin_delete" ON storage.objects;
CREATE POLICY "atelie_fotos_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'atelie-fotos' AND public.has_role(auth.uid(), 'admin'));
