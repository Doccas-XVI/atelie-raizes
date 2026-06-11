
-- =========================================================
-- ROLES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'artesa');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Usuário vê seus próprios papéis"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- =========================================================
-- ENUMS de domínio
-- =========================================================
CREATE TYPE public.pedido_status   AS ENUM ('novos','producao','prontos','entregues','cancelado');
CREATE TYPE public.pedido_tipo     AS ENUM ('Pronta Entrega','Personalizado','Misto');
CREATE TYPE public.item_kind       AS ENUM ('pronta','personalizado');
CREATE TYPE public.pagamento_forma  AS ENUM ('pix','credito','debito','transferencia','dinheiro');
CREATE TYPE public.pagamento_status AS ENUM ('pendente','parcial','pago');

-- =========================================================
-- HELPER updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$;

-- =========================================================
-- CATEGORIAS
-- =========================================================
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text NOT NULL UNIQUE,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categorias TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categorias TO authenticated;
GRANT ALL ON public.categorias TO service_role;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Todos leem categorias" ON public.categorias FOR SELECT USING (true);
CREATE POLICY "Admin gerencia categorias" ON public.categorias FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- PRODUTOS
-- =========================================================
CREATE TABLE public.produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid REFERENCES public.categorias(id) ON DELETE SET NULL,
  nome text NOT NULL,
  descricao text,
  preco numeric(10,2) NOT NULL CHECK (preco >= 0),
  estoque int NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  tempo_producao_dias int NOT NULL DEFAULT 3,
  como_e_feita text,
  ativo boolean NOT NULL DEFAULT true,
  excluido_em timestamptz,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX produtos_categoria_idx ON public.produtos(categoria_id);
CREATE INDEX produtos_ativo_idx ON public.produtos(ativo) WHERE excluido_em IS NULL;
CREATE TRIGGER produtos_updated BEFORE UPDATE ON public.produtos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.produtos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.produtos TO authenticated;
GRANT ALL ON public.produtos TO service_role;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público vê produtos ativos" ON public.produtos FOR SELECT
  USING (ativo = true AND excluido_em IS NULL);
CREATE POLICY "Admin vê todos produtos" ON public.produtos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin gerencia produtos" ON public.produtos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- PRODUTO FOTOS
-- =========================================================
CREATE TABLE public.produto_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX produto_fotos_produto_idx ON public.produto_fotos(produto_id);
GRANT SELECT ON public.produto_fotos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.produto_fotos TO authenticated;
GRANT ALL ON public.produto_fotos TO service_role;
ALTER TABLE public.produto_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público lê fotos" ON public.produto_fotos FOR SELECT USING (true);
CREATE POLICY "Admin gerencia fotos" ON public.produto_fotos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- ESMALTES
-- =========================================================
CREATE TABLE public.esmaltes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cor_hex text NOT NULL,
  foto_url text,
  ativo boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.esmaltes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.esmaltes TO authenticated;
GRANT ALL ON public.esmaltes TO service_role;
ALTER TABLE public.esmaltes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público lê esmaltes ativos" ON public.esmaltes FOR SELECT USING (ativo = true);
CREATE POLICY "Admin vê todos esmaltes" ON public.esmaltes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin gerencia esmaltes" ON public.esmaltes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- TIPOS PERSONALIZADO
-- =========================================================
CREATE TABLE public.tipos_personalizado (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preco_min numeric(10,2) NOT NULL,
  preco_max numeric(10,2) NOT NULL,
  preco_base numeric(10,2) NOT NULL,
  prazo_dias int NOT NULL DEFAULT 21,
  ativo boolean NOT NULL DEFAULT true,
  ordem int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tipos_personalizado TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tipos_personalizado TO authenticated;
GRANT ALL ON public.tipos_personalizado TO service_role;
ALTER TABLE public.tipos_personalizado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público lê tipos ativos" ON public.tipos_personalizado FOR SELECT USING (ativo = true);
CREATE POLICY "Admin vê todos tipos" ON public.tipos_personalizado FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin gerencia tipos" ON public.tipos_personalizado FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- CLIENTES
-- =========================================================
CREATE TABLE public.clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL,
  telefone text,
  email text,
  cidade text,
  estado text,
  cep text,
  endereco text,
  origem text,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clientes_whatsapp_idx ON public.clientes(whatsapp);
CREATE TRIGGER clientes_updated BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT INSERT ON public.clientes TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anônimo cria cliente no checkout" ON public.clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin gerencia clientes" ON public.clientes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- PEDIDOS
-- =========================================================
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE DEFAULT 'P' || upper(substring(gen_random_uuid()::text, 1, 8)),
  cliente_id uuid REFERENCES public.clientes(id) ON DELETE SET NULL,
  tipo public.pedido_tipo NOT NULL,
  status public.pedido_status NOT NULL DEFAULT 'novos',
  total numeric(10,2) NOT NULL DEFAULT 0,
  prazo_dias int NOT NULL DEFAULT 0,
  data_desejada_entrega date,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pedidos_cliente_idx ON public.pedidos(cliente_id);
CREATE INDEX pedidos_status_idx ON public.pedidos(status);
CREATE INDEX pedidos_criado_idx ON public.pedidos(criado_em DESC);
CREATE TRIGGER pedidos_updated BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT INSERT ON public.pedidos TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.pedidos TO authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anônimo cria pedido" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin gerencia pedidos" ON public.pedidos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- PEDIDO ITENS
-- =========================================================
CREATE TABLE public.pedido_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  kind public.item_kind NOT NULL,
  produto_id uuid REFERENCES public.produtos(id) ON DELETE SET NULL,
  tipo_personalizado_id uuid REFERENCES public.tipos_personalizado(id) ON DELETE SET NULL,
  esmalte_id uuid REFERENCES public.esmaltes(id) ON DELETE SET NULL,
  nome_snapshot text NOT NULL,
  descricao text,
  qtd int NOT NULL DEFAULT 1 CHECK (qtd > 0),
  preco_unit numeric(10,2) NOT NULL CHECK (preco_unit >= 0),
  prazo_dias int NOT NULL DEFAULT 0,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pedido_itens_pedido_idx ON public.pedido_itens(pedido_id);
GRANT INSERT ON public.pedido_itens TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.pedido_itens TO authenticated;
GRANT ALL ON public.pedido_itens TO service_role;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anônimo insere item" ON public.pedido_itens FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin gerencia itens" ON public.pedido_itens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- PAGAMENTOS
-- =========================================================
CREATE TABLE public.pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  forma public.pagamento_forma NOT NULL,
  status public.pagamento_status NOT NULL DEFAULT 'pendente',
  valor numeric(10,2) NOT NULL CHECK (valor >= 0),
  data date NOT NULL DEFAULT CURRENT_DATE,
  observacao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX pagamentos_pedido_idx ON public.pagamentos(pedido_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pagamentos TO authenticated;
GRANT ALL ON public.pagamentos TO service_role;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin gerencia pagamentos" ON public.pagamentos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- FAQ
-- =========================================================
CREATE TABLE public.faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta text NOT NULL,
  resposta text NOT NULL,
  ordem int NOT NULL DEFAULT 0,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER faq_updated BEFORE UPDATE ON public.faq
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.faq TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faq TO authenticated;
GRANT ALL ON public.faq TO service_role;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público lê FAQ ativo" ON public.faq FOR SELECT USING (ativo = true);
CREATE POLICY "Admin vê todo FAQ" ON public.faq FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin gerencia FAQ" ON public.faq FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- CONFIGURAÇÕES DO SITE
-- =========================================================
CREATE TABLE public.configuracoes_site (
  chave text PRIMARY KEY,
  valor jsonb NOT NULL DEFAULT '{}'::jsonb,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER configuracoes_site_updated BEFORE UPDATE ON public.configuracoes_site
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.configuracoes_site TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.configuracoes_site TO authenticated;
GRANT ALL ON public.configuracoes_site TO service_role;
ALTER TABLE public.configuracoes_site ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Público lê configurações" ON public.configuracoes_site FOR SELECT USING (true);
CREATE POLICY "Admin gerencia configurações" ON public.configuracoes_site FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
