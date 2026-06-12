import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  formatBRL,
  pagoStatus,
  useEsmaltes,
  useFAQ,
  usePedidos,
  useProdutosAdmin,
  useTipos,
  useConfig,
  whatsappLink,
  type Esmalte,
  type FAQ,
  type PedidoCompleto,
  type Produto,
  type TipoPersonalizado,
} from "@/lib/api";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Painel — Ateliê Raízes" }],
  }),
  component: Admin,
});

type Aba = "kanban" | "relatorios" | "estoque" | "produtos" | "esmaltes" | "tipos" | "faq" | "conteudo" | "admins";

const ABAS: { id: Aba; label: string }[] = [
  { id: "kanban", label: "Pedidos" },
  { id: "relatorios", label: "Relatórios" },
  { id: "estoque", label: "Estoque" },
  { id: "produtos", label: "Produtos" },
  { id: "esmaltes", label: "Esmaltes" },
  { id: "tipos", label: "Personalizados" },
  { id: "faq", label: "FAQ" },
  { id: "conteudo", label: "Conteúdo" },
  { id: "admins", label: "Admins" },
];

function Admin() {
  const navigate = useNavigate();
  const [aba, setAba] = useState<Aba>("kanban");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      if (!cancelled) setEmail(data.user.email ?? "");
      const { data: role } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (!cancelled) setIsAdmin(!!role);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <h1 className="text-lg font-semibold">Acesso não autorizado</h1>
        <p className="text-sm text-muted-foreground">
          Esse usuário não é admin do ateliê.
        </p>
        <button
          onClick={sair}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-surface"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-base font-semibold">Painel · Ateliê Raízes</h1>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <button
            onClick={sair}
            className="text-sm text-muted-foreground hover:underline"
          >
            Sair
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 pb-2 text-sm">
          {ABAS.map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`shrink-0 rounded-md px-3 py-1.5 ${
                aba === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {aba === "kanban" && <Kanban />}
        {aba === "relatorios" && <Relatorios />}
        {aba === "estoque" && <Estoque />}
        {aba === "produtos" && <ProdutosCRUD />}
        {aba === "esmaltes" && <EsmaltesCRUD />}
        {aba === "tipos" && <TiposCRUD />}
        {aba === "faq" && <FAQCRUD />}
        {aba === "conteudo" && <ConteudoCMS />}
        {aba === "admins" && <AdminsCRUD currentEmail={email} />}
      </main>
    </div>
  );
}

// ============ Kanban ============
const COLUNAS: { id: Database["public"]["Enums"]["pedido_status"]; titulo: string }[] = [
  { id: "novos", titulo: "Novos" },
  { id: "producao", titulo: "Em Produção" },
  { id: "prontos", titulo: "Prontos para Envio" },
  { id: "entregues", titulo: "Entregues" },
];

function Kanban() {
  const { data: pedidos = [], isLoading } = usePedidos();
  const hojeMs = new Date().setHours(0, 0, 0, 0);
  const novosHoje = pedidos.filter(
    (p) => p.status === "novos" && new Date(p.criado_em).getTime() >= hojeMs,
  ).length;
  const emProducao = pedidos.filter((p) => p.status === "producao").length;
  const pendentePagto = pedidos
    .filter((p) => p.status !== "entregues" && pagoStatus(p) !== "pago")
    .reduce((a, p) => a + Number(p.total), 0);

  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Pedidos novos hoje" value={String(novosHoje)} />
        <Stat label="Em produção" value={String(emProducao)} />
        <Stat label="Pendente de pagamento" value={formatBRL(pendentePagto)} />
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Pedidos
        </h2>
        {isLoading && (
          <p className="mt-3 text-sm text-muted-foreground">Carregando…</p>
        )}
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {COLUNAS.map((col) => {
            const cards = pedidos.filter((p) => p.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-md border border-border bg-surface p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{col.titulo}</h3>
                  <span className="text-xs text-muted-foreground">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.length === 0 && (
                    <p className="text-xs text-muted-foreground">Vazio.</p>
                  )}
                  {cards.map((p) => (
                    <PedidoCard key={p.id} pedido={p} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function PedidoCard({ pedido }: { pedido: PedidoCompleto }) {
  const qc = useQueryClient();
  const data = new Date(pedido.criado_em).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const status = pagoStatus(pedido);

  async function mover(direcao: 1 | -1) {
    const idx = COLUNAS.findIndex((c) => c.id === pedido.status);
    const next = idx + direcao;
    if (next < 0 || next >= COLUNAS.length) return;
    await supabase.from("pedidos").update({ status: COLUNAS[next].id }).eq("id", pedido.id);
    qc.invalidateQueries({ queryKey: ["pedidos"] });
  }
  async function togglePago() {
    if (status === "pago") {
      await supabase.from("pagamentos").delete().eq("pedido_id", pedido.id);
    } else {
      await supabase.from("pagamentos").insert({
        pedido_id: pedido.id,
        forma: "pix",
        status: "pago",
        valor: Number(pedido.total),
      });
    }
    qc.invalidateQueries({ queryKey: ["pedidos"] });
  }

  const itens = pedido.itens ?? [];
  return (
    <article className="rounded-md border border-border bg-card p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium">{pedido.cliente?.nome ?? "—"}</span>
        <span className="font-mono text-xs text-muted-foreground">{pedido.codigo}</span>
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {pedido.tipo} · {data}
      </div>
      <ul className="mt-2 space-y-0.5 text-xs">
        {itens.map((it) => (
          <li key={it.id}>
            • {it.nome_snapshot}
            {it.qtd > 1 && ` ×${it.qtd}`}
            {it.descricao && ` — "${it.descricao}"`}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold">{formatBRL(pedido.total)}</span>
        <span
          className={
            status === "pago"
              ? "rounded-sm bg-primary/15 px-1.5 py-0.5 text-primary"
              : status === "parcial"
                ? "rounded-sm bg-amber-500/15 px-1.5 py-0.5 text-amber-700"
                : "rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground"
          }
        >
          {status === "pago" ? "Pago" : status === "parcial" ? "Parcial" : "Aguardando"}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => mover(-1)}
          disabled={pedido.status === "novos"}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface disabled:opacity-30"
        >
          ←
        </button>
        <button
          onClick={() => mover(1)}
          disabled={pedido.status === "entregues"}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface disabled:opacity-30"
        >
          →
        </button>
        <button
          onClick={togglePago}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface"
        >
          {status === "pago" ? "Desmarcar pago" : "Marcar pago"}
        </button>
        {pedido.cliente?.whatsapp && (
          <a
            href={whatsappLink(pedido.cliente.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}

// ============ Estoque rápido ============
function Estoque() {
  const qc = useQueryClient();
  const { data: produtos = [] } = useProdutosAdmin();

  async function ajustar(id: string, delta: number, atual: number) {
    const novo = Math.max(0, atual + delta);
    await supabase.from("produtos").update({ estoque: novo }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }
  return (
    <section>
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Estoque rápido
      </h2>
      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
        {produtos.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="text-base font-medium">{p.nome}</div>
              <div className="text-xs text-muted-foreground">{formatBRL(p.preco)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => ajustar(p.id, -1, p.estoque)}
                className="h-9 w-9 rounded-md border border-border bg-background text-lg hover:bg-surface"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-semibold tabular-nums">
                {p.estoque}
              </span>
              <button
                onClick={() => ajustar(p.id, 1, p.estoque)}
                className="h-9 w-9 rounded-md border border-border bg-background text-lg hover:bg-surface"
              >
                +
              </button>
              {p.estoque === 0 && (
                <span className="ml-2 rounded-sm bg-destructive/10 px-2 py-1 text-xs text-destructive">
                  Esgotado
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ============ Produtos CRUD ============
function ProdutosCRUD() {
  const qc = useQueryClient();
  const { data: produtos = [] } = useProdutosAdmin();
  const [edit, setEdit] = useState<Partial<Produto> | null>(null);

  async function salvar() {
    if (!edit) return;
    const payload = {
      nome: edit.nome ?? "",
      descricao: edit.descricao ?? null,
      preco: Number(edit.preco ?? 0),
      estoque: Number(edit.estoque ?? 0),
      tempo_producao_dias: Number(edit.tempo_producao_dias ?? 3),
      como_e_feita: edit.como_e_feita ?? null,
      foto_url: edit.foto_url ?? null,
      ativo: edit.ativo ?? true,
      ordem: Number(edit.ordem ?? 0),
    };
    if (edit.id) {
      await supabase.from("produtos").update(payload).eq("id", edit.id);
    } else {
      await supabase.from("produtos").insert(payload);
    }
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }
  async function excluir(id: string) {
    if (!confirm("Excluir esse produto?")) return;
    await supabase.from("produtos").update({ excluido_em: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Produtos
        </h2>
        <button
          onClick={() =>
            setEdit({
              nome: "",
              preco: 0,
              estoque: 0,
              tempo_producao_dias: 3,
              como_e_feita: "",
              ativo: true,
              ordem: produtos.length + 1,
            })
          }
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Novo produto
        </button>
      </div>

      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
        {produtos.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-base font-medium">
                {p.nome}{" "}
                {!p.ativo && (
                  <span className="ml-2 rounded-sm bg-muted px-1.5 py-0.5 text-xs">
                    Inativo
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatBRL(p.preco)} · estoque {p.estoque} · {p.tempo_producao_dias}d
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEdit(p)}
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface"
              >
                Editar
              </button>
              <button
                onClick={() => excluir(p.id)}
                className="rounded border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {produtos.length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">Sem produtos.</li>
        )}
      </ul>

      {edit && (
        <Modal title={edit.id ? "Editar produto" : "Novo produto"} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <Field label="Nome">
              <input
                value={edit.nome ?? ""}
                onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
                className="input"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Preço (R$)">
                <input
                  type="number"
                  step="0.01"
                  value={String(edit.preco ?? 0)}
                  onChange={(e) => setEdit({ ...edit, preco: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Estoque">
                <input
                  type="number"
                  value={String(edit.estoque ?? 0)}
                  onChange={(e) => setEdit({ ...edit, estoque: Number(e.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Dias produção">
                <input
                  type="number"
                  value={String(edit.tempo_producao_dias ?? 3)}
                  onChange={(e) =>
                    setEdit({ ...edit, tempo_producao_dias: Number(e.target.value) })
                  }
                  className="input"
                />
              </Field>
            </div>
            <Field label="Descrição">
              <textarea
                rows={2}
                value={edit.descricao ?? ""}
                onChange={(e) => setEdit({ ...edit, descricao: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Como essa peça é feita">
              <textarea
                rows={4}
                value={edit.como_e_feita ?? ""}
                onChange={(e) => setEdit({ ...edit, como_e_feita: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Foto principal (URL — cole link público da imagem)">
              <input
                value={edit.foto_url ?? ""}
                onChange={(e) => setEdit({ ...edit, foto_url: e.target.value })}
                placeholder="https://..."
                className="input"
              />
              {edit.foto_url && (
                <img
                  src={edit.foto_url}
                  alt=""
                  className="mt-2 h-28 w-28 rounded-md border border-border object-cover"
                />
              )}
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.ativo ?? true}
                onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })}
              />
              Disponível no catálogo
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEdit(null)}
                className="rounded border border-border px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ============ Esmaltes CRUD ============
function EsmaltesCRUD() {
  const qc = useQueryClient();
  const { data = [] } = useEsmaltes(false);
  const [edit, setEdit] = useState<Partial<Esmalte> | null>(null);

  async function salvar() {
    if (!edit) return;
    const payload = {
      nome: edit.nome ?? "",
      cor_hex: edit.cor_hex ?? "#888888",
      ativo: edit.ativo ?? true,
      ordem: Number(edit.ordem ?? 0),
      foto_url: edit.foto_url ?? null,
    };
    if (edit.id) await supabase.from("esmaltes").update(payload).eq("id", edit.id);
    else await supabase.from("esmaltes").insert(payload);
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["esmaltes"] });
  }
  async function excluir(id: string) {
    if (!confirm("Excluir esmalte?")) return;
    await supabase.from("esmaltes").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["esmaltes"] });
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Esmaltes
        </h2>
        <button
          onClick={() =>
            setEdit({ nome: "", cor_hex: "#8B5A3C", ativo: true, ordem: data.length + 1 })
          }
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Novo esmalte
        </button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
        {data.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 p-3">
            <div className="flex items-center gap-3">
              <span
                className="h-10 w-10 rounded-full border border-border"
                style={{ backgroundColor: e.cor_hex }}
              />
              <div>
                <div className="text-base font-medium">{e.nome}</div>
                <div className="text-xs text-muted-foreground">{e.cor_hex}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEdit(e)}
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface"
              >
                Editar
              </button>
              <button
                onClick={() => excluir(e.id)}
                className="rounded border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
      {edit && (
        <Modal title={edit.id ? "Editar esmalte" : "Novo esmalte"} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <Field label="Nome">
              <input
                value={edit.nome ?? ""}
                onChange={(ev) => setEdit({ ...edit, nome: ev.target.value })}
                className="input"
              />
            </Field>
            <Field label="Cor (hex)">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={edit.cor_hex ?? "#888888"}
                  onChange={(ev) => setEdit({ ...edit, cor_hex: ev.target.value })}
                  className="h-10 w-14 rounded border border-border"
                />
                <input
                  value={edit.cor_hex ?? ""}
                  onChange={(ev) => setEdit({ ...edit, cor_hex: ev.target.value })}
                  className="input flex-1"
                />
              </div>
            </Field>
            <Field label="Foto (URL)">
              <input
                value={edit.foto_url ?? ""}
                onChange={(ev) => setEdit({ ...edit, foto_url: ev.target.value })}
                className="input"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.ativo ?? true}
                onChange={(ev) => setEdit({ ...edit, ativo: ev.target.checked })}
              />
              Disponível
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEdit(null)}
                className="rounded border border-border px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ============ Tipos personalizado CRUD ============
function TiposCRUD() {
  const qc = useQueryClient();
  const { data = [] } = useTipos(false);
  const [edit, setEdit] = useState<Partial<TipoPersonalizado> | null>(null);

  async function salvar() {
    if (!edit) return;
    const payload = {
      nome: edit.nome ?? "",
      preco_min: Number(edit.preco_min ?? 0),
      preco_max: Number(edit.preco_max ?? 0),
      preco_base: Number(edit.preco_base ?? 0),
      prazo_dias: Number(edit.prazo_dias ?? 21),
      ativo: edit.ativo ?? true,
      ordem: Number(edit.ordem ?? 0),
    };
    if (edit.id) await supabase.from("tipos_personalizado").update(payload).eq("id", edit.id);
    else await supabase.from("tipos_personalizado").insert(payload);
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["tipos"] });
  }
  async function excluir(id: string) {
    if (!confirm("Excluir tipo?")) return;
    await supabase.from("tipos_personalizado").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["tipos"] });
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Tipos de personalizado
        </h2>
        <button
          onClick={() =>
            setEdit({
              nome: "",
              preco_min: 0,
              preco_max: 0,
              preco_base: 0,
              prazo_dias: 21,
              ativo: true,
              ordem: data.length + 1,
            })
          }
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Novo tipo
        </button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
        {data.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="text-base font-medium">{t.nome}</div>
              <div className="text-xs text-muted-foreground">
                {formatBRL(t.preco_min)}–{formatBRL(t.preco_max)} · base{" "}
                {formatBRL(t.preco_base)} · {t.prazo_dias}d
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEdit(t)}
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface"
              >
                Editar
              </button>
              <button
                onClick={() => excluir(t.id)}
                className="rounded border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
      {edit && (
        <Modal title={edit.id ? "Editar tipo" : "Novo tipo"} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <Field label="Nome">
              <input
                value={edit.nome ?? ""}
                onChange={(ev) => setEdit({ ...edit, nome: ev.target.value })}
                className="input"
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Mín">
                <input
                  type="number"
                  step="0.01"
                  value={String(edit.preco_min ?? 0)}
                  onChange={(ev) => setEdit({ ...edit, preco_min: Number(ev.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Base">
                <input
                  type="number"
                  step="0.01"
                  value={String(edit.preco_base ?? 0)}
                  onChange={(ev) => setEdit({ ...edit, preco_base: Number(ev.target.value) })}
                  className="input"
                />
              </Field>
              <Field label="Máx">
                <input
                  type="number"
                  step="0.01"
                  value={String(edit.preco_max ?? 0)}
                  onChange={(ev) => setEdit({ ...edit, preco_max: Number(ev.target.value) })}
                  className="input"
                />
              </Field>
            </div>
            <Field label="Prazo (dias)">
              <input
                type="number"
                value={String(edit.prazo_dias ?? 21)}
                onChange={(ev) => setEdit({ ...edit, prazo_dias: Number(ev.target.value) })}
                className="input"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.ativo ?? true}
                onChange={(ev) => setEdit({ ...edit, ativo: ev.target.checked })}
              />
              Disponível
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEdit(null)}
                className="rounded border border-border px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ============ FAQ CRUD ============
function FAQCRUD() {
  const qc = useQueryClient();
  const { data = [] } = useFAQ(false);
  const [edit, setEdit] = useState<Partial<FAQ> | null>(null);

  async function salvar() {
    if (!edit) return;
    const payload = {
      pergunta: edit.pergunta ?? "",
      resposta: edit.resposta ?? "",
      ativo: edit.ativo ?? true,
      ordem: Number(edit.ordem ?? 0),
    };
    if (edit.id) await supabase.from("faq").update(payload).eq("id", edit.id);
    else await supabase.from("faq").insert(payload);
    setEdit(null);
    qc.invalidateQueries({ queryKey: ["faq"] });
  }
  async function excluir(id: string) {
    if (!confirm("Excluir pergunta?")) return;
    await supabase.from("faq").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["faq"] });
  }
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Dúvidas frequentes
        </h2>
        <button
          onClick={() =>
            setEdit({ pergunta: "", resposta: "", ativo: true, ordem: data.length + 1 })
          }
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Nova pergunta
        </button>
      </div>
      <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
        {data.map((f) => (
          <li key={f.id} className="flex items-start justify-between gap-3 p-4">
            <div>
              <div className="text-sm font-medium">
                {f.pergunta}
                {!f.ativo && (
                  <span className="ml-2 rounded-sm bg-muted px-1.5 py-0.5 text-xs">
                    Oculta
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{f.resposta}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEdit(f)}
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface"
              >
                Editar
              </button>
              <button
                onClick={() => excluir(f.id)}
                className="rounded border border-border px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
      {edit && (
        <Modal title={edit.id ? "Editar pergunta" : "Nova pergunta"} onClose={() => setEdit(null)}>
          <div className="space-y-3">
            <Field label="Pergunta">
              <input
                value={edit.pergunta ?? ""}
                onChange={(ev) => setEdit({ ...edit, pergunta: ev.target.value })}
                className="input"
              />
            </Field>
            <Field label="Resposta">
              <textarea
                rows={4}
                value={edit.resposta ?? ""}
                onChange={(ev) => setEdit({ ...edit, resposta: ev.target.value })}
                className="input"
              />
            </Field>
            <Field label="Ordem">
              <input
                type="number"
                value={String(edit.ordem ?? 0)}
                onChange={(ev) => setEdit({ ...edit, ordem: Number(ev.target.value) })}
                className="input"
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.ativo ?? true}
                onChange={(ev) => setEdit({ ...edit, ativo: ev.target.checked })}
              />
              Visível
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEdit(null)}
                className="rounded border border-border px-3 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Salvar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

// ============ Conteúdo do site ============
const CHAVES_CONTEUDO: { chave: string; label: string; campos: { id: string; label: string; tipo?: "text" | "textarea" }[] }[] = [
  {
    chave: "hero",
    label: "Topo da home (Hero)",
    campos: [
      { id: "titulo", label: "Título" },
      { id: "subtitulo", label: "Subtítulo", tipo: "textarea" },
    ],
  },
  {
    chave: "sobre_artesa",
    label: "Sobre a artesã",
    campos: [{ id: "texto", label: "Texto", tipo: "textarea" }],
  },
  {
    chave: "sobre_atelie",
    label: "Sobre o ateliê",
    campos: [{ id: "texto", label: "Texto", tipo: "textarea" }],
  },
  {
    chave: "por_que_esse_preco",
    label: "Por que esse preço (destaque)",
    campos: [{ id: "texto", label: "Texto", tipo: "textarea" }],
  },
  {
    chave: "contato",
    label: "Contato",
    campos: [
      { id: "whatsapp", label: "WhatsApp" },
      { id: "email", label: "Email" },
      { id: "endereco", label: "Endereço" },
    ],
  },
  {
    chave: "redes_sociais",
    label: "Redes sociais",
    campos: [
      { id: "instagram", label: "Instagram (@usuario ou URL)" },
      { id: "facebook", label: "Facebook" },
    ],
  },
];

function ConteudoCMS() {
  return (
    <section className="space-y-6">
      {CHAVES_CONTEUDO.map((bloco) => (
        <ConteudoBloco key={bloco.chave} bloco={bloco} />
      ))}
    </section>
  );
}

function ConteudoBloco({
  bloco,
}: {
  bloco: (typeof CHAVES_CONTEUDO)[number];
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useConfig<Record<string, string>>(bloco.chave);
  const [val, setVal] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (data) setVal({ ...data });
  }, [data]);

  async function salvar() {
    await supabase.from("configuracoes_site").upsert({ chave: bloco.chave, valor: val });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
    qc.invalidateQueries({ queryKey: ["config", bloco.chave] });
  }

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <h3 className="text-sm font-semibold">{bloco.label}</h3>
      {isLoading ? (
        <p className="mt-2 text-xs text-muted-foreground">Carregando…</p>
      ) : (
        <div className="mt-3 space-y-3">
          {bloco.campos.map((c) =>
            c.tipo === "textarea" ? (
              <Field key={c.id} label={c.label}>
                <textarea
                  rows={3}
                  value={val[c.id] ?? ""}
                  onChange={(e) => setVal({ ...val, [c.id]: e.target.value })}
                  className="input"
                />
              </Field>
            ) : (
              <Field key={c.id} label={c.label}>
                <input
                  value={val[c.id] ?? ""}
                  onChange={(e) => setVal({ ...val, [c.id]: e.target.value })}
                  className="input"
                />
              </Field>
            ),
          )}
          <div className="flex justify-end">
            <button
              onClick={salvar}
              className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              {salvo ? "Salvo ✓" : "Salvar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Relatórios ============
function Relatorios() {
  const { data: pedidos = [], isLoading } = usePedidos();

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).getTime();
  const inicio30 = agora.getTime() - 30 * 24 * 60 * 60 * 1000;

  const entregues = pedidos.filter((p) => p.status === "entregues");
  const pagos = pedidos.filter((p) => pagoStatus(p) === "pago");

  const totalRecebido = pagos.reduce((a, p) => a + Number(p.total), 0);
  const totalPendente = pedidos
    .filter((p) => pagoStatus(p) !== "pago")
    .reduce((a, p) => a + Number(p.total), 0);

  const noMes = pagos.filter((p) => new Date(p.criado_em).getTime() >= inicioMes);
  const receitaMes = noMes.reduce((a, p) => a + Number(p.total), 0);

  const ultimos30 = pedidos.filter((p) => new Date(p.criado_em).getTime() >= inicio30);
  const ticketMedio =
    entregues.length > 0
      ? entregues.reduce((a, p) => a + Number(p.total), 0) / entregues.length
      : 0;

  // Por tipo
  const porTipo = pedidos.reduce<Record<string, { qtd: number; total: number }>>((acc, p) => {
    const k = p.tipo;
    acc[k] = acc[k] || { qtd: 0, total: 0 };
    acc[k].qtd += 1;
    acc[k].total += Number(p.total);
    return acc;
  }, {});

  // Top produtos
  const contagem: Record<string, { nome: string; qtd: number; receita: number }> = {};
  for (const p of pedidos) {
    for (const it of p.itens ?? []) {
      const k = it.nome_snapshot || "—";
      contagem[k] = contagem[k] || { nome: k, qtd: 0, receita: 0 };
      contagem[k].qtd += it.qtd;
      contagem[k].receita += Number(it.preco_unit) * it.qtd;
    }
  }
  const topProdutos = Object.values(contagem)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 8);

  // Pedidos por mês (últimos 6)
  const meses: { rotulo: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const fim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
    const t = pagos
      .filter((p) => {
        const ts = new Date(p.criado_em).getTime();
        return ts >= d.getTime() && ts < fim.getTime();
      })
      .reduce((a, p) => a + Number(p.total), 0);
    meses.push({
      rotulo: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      total: t,
    });
  }
  const maxMes = Math.max(1, ...meses.map((m) => m.total));

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando relatórios…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Receita recebida" value={formatBRL(totalRecebido)} />
        <Stat label="Receita no mês" value={formatBRL(receitaMes)} />
        <Stat label="Pendente de pagto" value={formatBRL(totalPendente)} />
        <Stat label="Ticket médio (entregues)" value={formatBRL(ticketMedio)} />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pedidos no total" value={String(pedidos.length)} />
        <Stat label="Pedidos últimos 30d" value={String(ultimos30.length)} />
        <Stat label="Entregues" value={String(entregues.length)} />
        <Stat label="Pagos" value={String(pagos.length)} />
      </section>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Receita por mês (pagos)
        </h3>
        <div className="mt-3 flex items-end gap-3 rounded-md border border-border bg-card p-4">
          {meses.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end">
                <div
                  className="w-full rounded-t bg-primary/80"
                  style={{ height: `${(m.total / maxMes) * 100}%` }}
                  title={formatBRL(m.total)}
                />
              </div>
              <div className="text-xs text-muted-foreground">{m.rotulo}</div>
              <div className="text-xs font-medium tabular-nums">{formatBRL(m.total)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Por tipo de pedido
          </h3>
          <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
            {Object.entries(porTipo).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between p-3 text-sm">
                <span>{k}</span>
                <span className="text-muted-foreground">
                  {v.qtd} pedido{v.qtd === 1 ? "" : "s"} ·{" "}
                  <span className="font-medium text-foreground">{formatBRL(v.total)}</span>
                </span>
              </li>
            ))}
            {Object.keys(porTipo).length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">Sem pedidos ainda.</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Peças mais pedidas
          </h3>
          <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
            {topProdutos.map((p) => (
              <li key={p.nome} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="truncate">{p.nome}</span>
                <span className="shrink-0 text-muted-foreground">
                  {p.qtd}× · {formatBRL(p.receita)}
                </span>
              </li>
            ))}
            {topProdutos.length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">Sem itens ainda.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

// ============ Shared UI ============
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-md border border-border bg-card p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ============ Admins ============
type AdminRow = { user_id: string; email: string; is_admin: boolean };

function AdminsCRUD({ currentEmail }: { currentEmail: string }) {
  const [rows, setRows] = useState<AdminRow[] | null>(null);
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setErro("");
    const { data, error } = await supabase.rpc("list_admins");
    if (error) {
      setErro(error.message);
      setRows([]);
      return;
    }
    setRows((data ?? []) as AdminRow[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function promover(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setOk("");
    setBusy(true);
    const { error } = await supabase.rpc("promote_admin_by_email", { _email: email.trim() });
    setBusy(false);
    if (error) {
      setErro(error.message);
      return;
    }
    setOk(`${email} agora é admin.`);
    setEmail("");
    load();
  }

  async function revogar(user_id: string, alvoEmail: string) {
    if (!confirm(`Remover acesso admin de ${alvoEmail}?`)) return;
    setErro("");
    setOk("");
    const { error } = await supabase.rpc("revoke_admin", { _user_id: user_id });
    if (error) {
      setErro(error.message);
      return;
    }
    setOk(`Acesso admin de ${alvoEmail} removido.`);
    load();
  }

  const admins = (rows ?? []).filter((r) => r.is_admin);

  return (
    <section className="max-w-2xl space-y-6">
      <div className="rounded-md border border-border bg-card p-4">
        <h2 className="text-base font-semibold">Nomear novo admin</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A pessoa precisa primeiro criar o acesso em <code>/auth</code> com o email
          dela. Depois, informe esse email aqui para promovê-la a admin.
        </p>
        <form onSubmit={promover} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="email@exemplo.com"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Aguarde…" : "Promover a admin"}
          </button>
        </form>
        {ok && <p className="mt-2 text-sm text-emerald-600">{ok}</p>}
        {erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}
      </div>

      <div className="rounded-md border border-border bg-card p-4">
        <h2 className="text-base font-semibold">Admins atuais</h2>
        {rows === null ? (
          <p className="mt-3 text-sm text-muted-foreground">Carregando…</p>
        ) : admins.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum admin.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {admins.map((r) => (
              <li
                key={r.user_id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span>
                  {r.email}
                  {r.email === currentEmail && (
                    <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                  )}
                </span>
                {r.email !== currentEmail && (
                  <button
                    onClick={() => revogar(r.user_id, r.email)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remover admin
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
