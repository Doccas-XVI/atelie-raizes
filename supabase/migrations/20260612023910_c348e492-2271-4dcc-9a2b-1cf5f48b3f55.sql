-- Categorias
INSERT INTO public.categorias (nome, slug, ordem)
SELECT 'Peças', 'pecas', 1
WHERE NOT EXISTS (SELECT 1 FROM public.categorias);

-- Produtos iniciais
INSERT INTO public.produtos (nome, preco, estoque, tempo_producao_dias, como_e_feita, ordem, categoria_id)
SELECT v.nome, v.preco, v.estoque, v.tempo, v.como, v.ordem, (SELECT id FROM public.categorias ORDER BY ordem LIMIT 1)
FROM (VALUES
  ('Caneca', 120::numeric, 6, 8, 'Modelada à mão em torno elétrico com cerca de 350g de argila. Passa por secagem lenta de 5 dias, primeira queima a 950°C, esmaltação manual e segunda queima a 1230°C.', 1),
  ('Copinho de Café', 55::numeric, 12, 8, 'Peça pequena torneada à mão, parede fina exige técnica apurada. Duas queimas e esmalte alimentar aplicado por imersão. Cada copinho leva cerca de 8 dias até ficar pronto.', 2),
  ('Boleira P', 162::numeric, 3, 14, 'Base e prato modelados separadamente e unidos antes da primeira queima. Esmalte aplicado em duas camadas para garantir o brilho. Processo completo leva 14 dias.', 3),
  ('Conjunto Jarra e Caneca', 290::numeric, 2, 18, 'Conjunto torneado no mesmo lote para garantir tom uniforme do esmalte. Alça da jarra modelada à mão e fixada antes da secagem. Duas queimas e controle de pares.', 4),
  ('Cinzeiro', 45::numeric, 8, 7, 'Modelado com técnica de placa, bordas alisadas à mão. Esmalte resistente a altas temperaturas. Cada peça é única em formato e tonalidade.', 5)
) v(nome, preco, estoque, tempo, como, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.produtos);

-- Esmaltes
INSERT INTO public.esmaltes (nome, cor_hex, ordem)
SELECT v.nome, v.cor, v.ordem
FROM (VALUES
  ('Terra Queimada', '#8B5A3C', 1),
  ('Areia', '#C9B79C', 2),
  ('Verde Oliva', '#6B7A3E', 3),
  ('Azul Profundo', '#3B5A7A', 4),
  ('Vermelho Telha', '#A04A35', 5),
  ('Cru Fosco', '#E8DCC4', 6)
) v(nome, cor, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.esmaltes);

-- Tipos personalizados
INSERT INTO public.tipos_personalizado (nome, preco_min, preco_max, preco_base, prazo_dias, ordem)
SELECT v.nome, v.pmin, v.pmax, v.pbase, v.prazo, v.ordem
FROM (VALUES
  ('Caneca', 140::numeric, 180::numeric, 160::numeric, 25, 1),
  ('Prato', 110::numeric, 160::numeric, 135::numeric, 22, 2),
  ('Bowl', 120::numeric, 170::numeric, 145::numeric, 22, 3)
) v(nome, pmin, pmax, pbase, prazo, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_personalizado);

-- FAQ
INSERT INTO public.faq (pergunta, resposta, ordem)
SELECT v.q, v.a, v.ordem
FROM (VALUES
  ('Quanto tempo demora um pedido personalizado?', 'Entre 22 e 25 dias úteis, dependendo do tipo de peça. O prazo aparece automaticamente quando você monta o pedido.', 1),
  ('E peças de pronta entrega?', 'Saem do ateliê em até 3 dias úteis após a confirmação do pagamento.', 2),
  ('Como funciona o pagamento?', 'PIX ou transferência. Para personalizados, 50% na confirmação e 50% antes do envio. Pronta entrega: pagamento integral à vista.', 3),
  ('Vocês enviam para todo o Brasil?', 'Sim. Frete por Correios ou transportadora, calculado pelo CEP. Embalagem reforçada com plástico bolha e caixa dupla.', 4),
  ('Posso escolher o esmalte?', 'Sim, em peças personalizadas. As cores disponíveis aparecem com foto real na aba de encomendas.', 5),
  ('E se a peça quebrar no transporte?', 'Envie uma foto da embalagem e da peça em até 48h. Reembolsamos ou refazemos sem custo adicional.', 6),
  ('Posso pedir um modelo que não está no catálogo?', 'Sim, chame no WhatsApp com referência visual. Avaliamos viabilidade e prazo caso a caso.', 7),
  ('Posso ir buscar pessoalmente?', 'Sim, retirada combinada por WhatsApp. Sem custo de frete nesse caso.', 8),
  ('As peças vão na máquina de lavar / micro-ondas?', 'Micro-ondas sim. Lava-louças: melhor lavar à mão para preservar o esmalte por mais tempo.', 9),
  ('Faz lembrancinhas em quantidade?', 'Sim, a partir de 20 unidades. Prazo mínimo de 45 dias. Peça um orçamento no WhatsApp.', 10)
) v(q, a, ordem)
WHERE NOT EXISTS (SELECT 1 FROM public.faq);

-- Configurações do site
INSERT INTO public.configuracoes_site (chave, valor) VALUES
  ('hero', '{"titulo":"Cerâmica feita à mão, peça por peça.","subtitulo":"Escolha uma peça pronta, encomende algo personalizado ou entenda como tudo é feito antes de perguntar o preço."}'::jsonb),
  ('sobre_artesa', '{"texto":"Cada peça do Ateliê Raízes é feita por uma única pessoa, do começo ao fim — da modelagem na argila até a queima final."}'::jsonb),
  ('sobre_atelie', '{"texto":"Um pequeno ateliê de cerâmica artesanal, com peças únicas e produção em pequena escala."}'::jsonb),
  ('por_que_esse_preco', '{"texto":"Cada peça leva em média 18 dias e passa por 6 etapas. Não é industrializado — é feito por uma pessoa, do zero."}'::jsonb),
  ('contato', '{"whatsapp":"","email":"","endereco":""}'::jsonb),
  ('redes_sociais', '{"instagram":"","facebook":""}'::jsonb),
  ('prazos_padrao', '{"pronta_entrega_dias":3,"personalizado_dias":22}'::jsonb)
ON CONFLICT (chave) DO NOTHING;