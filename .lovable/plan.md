## Análise do estado atual

O projeto hoje funciona 100% no navegador (`localStorage`), com a lógica concentrada em `src/lib/store.ts`. Já estão implementados e devem ser **preservados integralmente**:

- Catálogo de pronta entrega (`/pecas`) com "Como essa peça é feita"
- Fluxo de personalizados em 3 passos (`/personalizado`)
- Página "Por que esse preço?" (`/processo`) e FAQ (`/faq`)
- Checkout + envio para WhatsApp (`/checkout`, `/sucesso`)
- Painel administrativo com login, Kanban de pedidos (Novos / Produção / Prontos / Entregues) e ajuste manual de estoque (`/admin`)
- Header, identidade "Ateliê Raízes", tokens de design

### Limitações encontradas

1. **Sem backend**: dados vivem em `localStorage` — somem se a artesã trocar de dispositivo, navegador, ou limpar o cache. Impossível ela ver pedidos feitos por clientes de outro device.
2. **Produtos hardcoded** em `PRODUTOS_INICIAIS`. Painel só altera estoque (+/−). Não há criar, editar, excluir, foto, categoria, descrição, tempo de produção, disponibilidade.
3. **Esmaltes e tipos de personalizado** também hardcoded (`ESMALTES`, `TIPOS_PERSONALIZADO`). Sem foto do esmalte. Sem edição.
4. **Conteúdo do site fixo no código**: textos do processo, FAQ, "por que esse preço", contato, redes sociais — qualquer mudança hoje exige programador.
5. **Imagens genéricas/emojis**: catálogo usa emoji no lugar de foto. Sem hero, sem galeria, sem seção sobre a artesã/ateliê.
6. **Cliente mínimo**: só nome + WhatsApp. Sem endereço, CEP, cidade, data de entrega, origem, observações. Sem tabela de clientes — cada pedido repete os dados.
7. **Pagamento inexistente como entidade**: só um booleano `pago`. Sem forma de pagamento, valor pago, data, parciais.
8. **Sem relatórios**: o painel mostra 3 números do dia, mas não há receita, ticket médio, produto mais vendido, etc.
9. **Sem upload de imagem**: não existe storage configurado.
10. **Senha do admin hardcoded** (`barro2026`) — não é autenticação real.

## Plano de implementação

Vou executar em **5 fases**. A cada fase o site continua funcionando; nada do fluxo atual é removido — apenas migrado de `localStorage` para o backend e estendido.

### Fase 1 — Infraestrutura (Lovable Cloud)

1. Ativar Lovable Cloud (já solicitado).
2. Criar autenticação real (email + senha) e tabela `user_roles` com role `admin` para a artesã. Login em `/admin` passa a usar Supabase Auth; a senha hardcoded sai.
3. Criar bucket de Storage `atelie-fotos` (público para leitura, escrita só por admin) para fotos de produtos, esmaltes, hero, galeria, processo.
4. Modelagem do banco (todas no schema `public`, com RLS + GRANTs + policies via `has_role`):

```text
categorias        (id, nome, slug, ordem)
produtos          (id, categoria_id, nome, descricao, preco, estoque,
                   tempo_producao_dias, como_e_feita, ativo, excluido_em,
                   ordem, criado_em)
produto_fotos     (id, produto_id, url, ordem, alt)
esmaltes          (id, nome, cor_hex, foto_url, ativo, ordem)
tipos_personalizado (id, nome, preco_min, preco_max, preco_base,
                     prazo_dias, ativo)
clientes          (id, nome, whatsapp, telefone, email, cidade, estado,
                   cep, endereco, origem, observacoes, criado_em)
pedidos           (id, cliente_id, tipo, status, total, prazo_dias,
                   data_desejada_entrega, criado_em, observacoes)
pedido_itens      (id, pedido_id, kind, produto_id, tipo_personalizado_id,
                   esmalte_id, descricao, qtd, preco_unit)
pagamentos        (id, pedido_id, forma, status, valor, data, observacao)
                   -- forma: pix|credito|debito|transferencia|dinheiro
                   -- status: pendente|parcial|pago
faq               (id, pergunta, resposta, ordem, ativo)
configuracoes_site (chave, valor_json)
                   -- chaves: bio_artesa, sobre_atelie, por_que_esse_preco,
                   -- contato, redes_sociais, prazos_padrao, hero
```

Views auxiliares para relatórios: `vw_vendas_mensais`, `vw_produto_mais_vendido`, `vw_ticket_medio`, `vw_receita_por_categoria`, `vw_pedidos_por_cidade`. Permissão `SELECT` para `authenticated` admin, expostas via `createServerFn` — facilita o pipeline Power Automate / Excel / Copilot depois (apenas estruturação; integração externa fica fora desta fase).

5. Migração: na primeira carga do admin autenticado, semear `produtos`, `esmaltes`, `tipos_personalizado` e textos a partir dos valores hoje em `store.ts`, **só se as tabelas estiverem vazias**. Nada se perde.

### Fase 2 — CMS de produtos, esmaltes e personalizados

- Substituir `src/lib/store.ts` por hooks/server functions (`produtos.functions.ts`, `pedidos.functions.ts`, etc.) que falam com Supabase. O catálogo, personalizado e checkout passam a ler do banco — **mesmas telas, mesmas URLs, mesmo visual**.
- Nova aba `/admin/produtos`:
  - Lista com busca, filtro por categoria, badge "Esgotado/Inativo/Excluído".
  - Botão **Novo produto** → formulário com Nome, Categoria, Descrição, Preço, Estoque, Tempo de produção, "Como é feita", Disponível, Upload múltiplo de fotos (com preview, reordenar, excluir).
  - Editar / Excluir (lógico, com **Lixeira** e botão Restaurar).
- Nova aba `/admin/personalizados`: CRUD de tipos + CRUD de esmaltes (com foto do esmalte).
- Categorias gerenciáveis em `/admin/categorias`.

### Fase 3 — CMS de conteúdo do site

- Nova aba `/admin/conteudo` editando `configuracoes_site`:
  - Bio da artesã, Sobre o ateliê, Por que esse preço, Prazos padrão, Contato (WhatsApp, email, endereço), Redes sociais (Instagram, etc.), Hero (título, subtítulo, imagem).
- Nova aba `/admin/faq` — CRUD com reordenação.
- Páginas públicas (`/processo`, `/faq`, home) passam a ler dessas tabelas. Mudança aparece na hora.

### Fase 4 — Identidade visual com as imagens reais

Quando você enviar logo, fotos de produtos, ateliê e processo, eu:

1. Subo logo para `src/assets/` e troco no Header.
2. Crio **Hero** profissional na home com a foto principal + CTA.
3. Crio seções **Sobre a artesã**, **Sobre o ateliê**, **Processo artesanal** (visual, com as fotos do processo).
4. Catálogo passa a usar as fotos reais (já suportado pelo CRUD da Fase 2). Galeria dedicada em `/galeria` opcional.
5. Mantenho o estilo minimalista e a paleta atual.

### Fase 5 — Clientes, pagamentos e relatórios

- Checkout expandido: Nome, WhatsApp, Telefone, Email, CEP (auto-preenche endereço via ViaCEP), Cidade, Estado, Endereço, Data desejada, Como conheceu (origem), Observações. Cliente é salvo/atualizado em `clientes` e ligado ao pedido.
- Nova aba `/admin/clientes`: lista, busca, histórico de pedidos por cliente, identificação de recorrentes.
- Pedido no Kanban ganha botão **Registrar pagamento** → forma (PIX/Crédito/Débito/Transferência/Dinheiro), valor, data. Suporta múltiplos pagamentos (parcial → pago automaticamente quando soma == total).
- Nova aba `/admin/relatorios` (dashboard):
  - Pedidos: novos, em produção, entregues (mês e total).
  - Receita total, receita mensal, ticket médio.
  - Produto mais vendido, categoria mais vendida.
  - Clientes recorrentes, pedidos por cidade.
  - Formas de pagamento mais usadas.
  - Conversão orçamento → venda (personalizados que viraram pedido pago).
- Estrutura pronta para Power Automate puxar via API (`/api/public/relatorios/*` com chave) → Excel Online → Copilot. Implemento os endpoints de leitura agora; a configuração no Power Automate é do seu lado.

## O que **não** muda

- URLs, layouts, fluxo do cliente (catálogo → personalizado → checkout → WhatsApp).
- Kanban com as 4 colunas atuais (Novos / Produção / Prontos / Entregues).
- Página de processo, FAQ, "Como essa peça é feita".
- Identidade "Ateliê Raízes", paleta, tipografia.

## Ordem de execução proposta

1. **Fase 1** (infra + auth + schema + migração de dados).
2. **Fase 2** (CRUD produtos / esmaltes / personalizados — desbloqueia a artesã imediatamente).
3. **Fase 3** (CMS de textos e FAQ).
4. **Fase 5** (clientes, pagamentos, relatórios) — antes da Fase 4 porque é estrutural.
5. **Fase 4** (identidade visual) — assim que você enviar logo e fotos.

## Próximo passo

Se aprovar, começo pela **Fase 1**: ativo o Lovable Cloud, monto o schema completo com RLS e a migração dos dados atuais. Cada fase é entregue funcional antes de seguir para a próxima — você consegue testar e me avisar ajustes no meio do caminho.

Quer que eu siga nessa ordem, ou prefere priorizar alguma fase (ex.: já mandar logo + fotos para a Fase 4 vir antes)?