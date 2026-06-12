
CREATE OR REPLACE FUNCTION public.criar_pedido(
  _cliente jsonb,
  _itens jsonb
) RETURNS TABLE(id uuid, codigo text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cliente_id uuid;
  v_pedido_id uuid;
  v_codigo text;
  v_total numeric := 0;
  v_prazo int := 0;
  v_tem_pronta boolean := false;
  v_tem_perso boolean := false;
  v_tipo pedido_tipo;
  it jsonb;
  v_qtd int;
  v_preco numeric;
  v_item_prazo int;
  v_estoque int;
BEGIN
  IF jsonb_array_length(_itens) = 0 THEN
    RAISE EXCEPTION 'Carrinho vazio';
  END IF;

  -- Totais e tipo
  FOR it IN SELECT * FROM jsonb_array_elements(_itens) LOOP
    v_qtd := COALESCE((it->>'qtd')::int, 1);
    v_preco := (it->>'preco_unit')::numeric;
    v_item_prazo := COALESCE((it->>'prazo_dias')::int, 3);
    v_total := v_total + v_preco * v_qtd;
    IF v_item_prazo > v_prazo THEN v_prazo := v_item_prazo; END IF;
    IF (it->>'kind') = 'pronta' THEN v_tem_pronta := true; ELSE v_tem_perso := true; END IF;
  END LOOP;

  v_tipo := CASE
    WHEN v_tem_pronta AND v_tem_perso THEN 'Misto'::pedido_tipo
    WHEN v_tem_perso THEN 'Personalizado'::pedido_tipo
    ELSE 'Pronta Entrega'::pedido_tipo
  END;

  -- Cliente
  INSERT INTO public.clientes (nome, whatsapp, email, cep, endereco, cidade, estado, observacoes)
  VALUES (
    _cliente->>'nome',
    _cliente->>'whatsapp',
    NULLIF(_cliente->>'email',''),
    NULLIF(_cliente->>'cep',''),
    NULLIF(_cliente->>'endereco',''),
    NULLIF(_cliente->>'cidade',''),
    NULLIF(_cliente->>'estado',''),
    NULLIF(_cliente->>'observacoes','')
  ) RETURNING clientes.id INTO v_cliente_id;

  -- Pedido
  INSERT INTO public.pedidos (cliente_id, tipo, total, prazo_dias)
  VALUES (v_cliente_id, v_tipo, v_total, v_prazo)
  RETURNING pedidos.id, pedidos.codigo INTO v_pedido_id, v_codigo;

  -- Itens + estoque
  FOR it IN SELECT * FROM jsonb_array_elements(_itens) LOOP
    IF (it->>'kind') = 'pronta' THEN
      v_qtd := COALESCE((it->>'qtd')::int, 1);
      INSERT INTO public.pedido_itens (pedido_id, kind, produto_id, nome_snapshot, qtd, preco_unit, prazo_dias)
      VALUES (
        v_pedido_id, 'pronta', (it->>'produto_id')::uuid,
        it->>'nome_snapshot', v_qtd, (it->>'preco_unit')::numeric, 3
      );
      SELECT estoque INTO v_estoque FROM public.produtos WHERE id = (it->>'produto_id')::uuid;
      IF v_estoque IS NOT NULL THEN
        UPDATE public.produtos SET estoque = GREATEST(0, v_estoque - v_qtd)
        WHERE id = (it->>'produto_id')::uuid;
      END IF;
    ELSE
      INSERT INTO public.pedido_itens (pedido_id, kind, tipo_personalizado_id, esmalte_id, nome_snapshot, descricao, qtd, preco_unit, prazo_dias)
      VALUES (
        v_pedido_id, 'personalizado',
        (it->>'tipo_personalizado_id')::uuid,
        (it->>'esmalte_id')::uuid,
        it->>'nome_snapshot',
        it->>'descricao',
        1,
        (it->>'preco_unit')::numeric,
        COALESCE((it->>'prazo_dias')::int, 7)
      );
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_pedido_id, v_codigo;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_pedido(jsonb, jsonb) TO anon, authenticated;
