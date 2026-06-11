
-- Restringe execução da has_role: políticas continuam funcionando (rodam como owner)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- CLIENTES: substitui USING(true) por validação básica
DROP POLICY IF EXISTS "Anônimo cria cliente no checkout" ON public.clientes;
CREATE POLICY "Anônimo cria cliente no checkout" ON public.clientes
  FOR INSERT
  WITH CHECK (
    char_length(nome) BETWEEN 2 AND 120
    AND char_length(whatsapp) BETWEEN 8 AND 30
  );

-- PEDIDOS: validação básica
DROP POLICY IF EXISTS "Anônimo cria pedido" ON public.pedidos;
CREATE POLICY "Anônimo cria pedido" ON public.pedidos
  FOR INSERT
  WITH CHECK (
    total >= 0
    AND prazo_dias >= 0
    AND cliente_id IS NOT NULL
  );

-- PEDIDO ITENS: validação básica
DROP POLICY IF EXISTS "Anônimo insere item" ON public.pedido_itens;
CREATE POLICY "Anônimo insere item" ON public.pedido_itens
  FOR INSERT
  WITH CHECK (
    qtd > 0
    AND preco_unit >= 0
    AND char_length(nome_snapshot) BETWEEN 1 AND 200
    AND pedido_id IS NOT NULL
  );
