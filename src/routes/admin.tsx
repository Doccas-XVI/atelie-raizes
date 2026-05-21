import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  formatBRL,
  getPedidos,
  getProdutos,
  isAdminAuth,
  setAdminAuth,
  setPedidos,
  setProdutos,
  useStore,
  whatsappLink,
  type Pedido,
} from "@/lib/store";

const SENHA = "barro2026";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Painel — Ateliê Raízes" }],
  }),
  component: Admin,
});

const COLUNAS: { id: Pedido["status"]; titulo: string }[] = [
  { id: "novos", titulo: "Novos" },
  { id: "producao", titulo: "Em Produção" },
  { id: "prontos", titulo: "Prontos para Envio" },
  { id: "entregues", titulo: "Entregues" },
];

function Admin() {
  const auth = useStore(isAdminAuth);
  if (!auth) return <Login />;
  return <Painel />;
}

function Login() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (senha === SENHA) setAdminAuth(true);
          else setErro("Senha incorreta.");
        }}
        className="w-full max-w-sm rounded-md border border-border bg-card p-5"
      >
        <h1 className="text-lg font-semibold">Painel da Artesã</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesso restrito.
        </p>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha"
          className="mt-4 w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:border-primary"
          autoFocus
        />
        {erro && <p className="mt-2 text-sm text-destructive">{erro}</p>}
        <button
          type="submit"
          className="mt-3 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          Entrar
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          Dica do protótipo: <code className="font-mono">{SENHA}</code>
        </p>
      </form>
    </div>
  );
}

function Painel() {
  const pedidos = useStore(getPedidos);
  const produtos = useStore(getProdutos);

  const hoje = new Date().setHours(0, 0, 0, 0);
  const novosHoje = pedidos.filter(
    (p) => p.status === "novos" && p.criadoEm >= hoje,
  ).length;
  const emProducao = pedidos.filter((p) => p.status === "producao").length;
  const pendentePagto = pedidos
    .filter((p) => !p.pago && p.status !== "entregues")
    .reduce((a, p) => a + p.total, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-base font-semibold">Painel · Ateliê Raízes</h1>
          <button
            onClick={() => setAdminAuth(false)}
            className="text-sm text-muted-foreground hover:underline"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Resumo do dia */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Pedidos novos hoje" value={String(novosHoje)} />
          <Stat label="Em produção" value={String(emProducao)} />
          <Stat label="Pendente de pagamento" value={formatBRL(pendentePagto)} />
        </section>

        {/* Kanban */}
        <section className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Pedidos
          </h2>
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
                    <span className="text-xs text-muted-foreground">
                      {cards.length}
                    </span>
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

        {/* Estoque */}
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Estoque · Pronta entrega
          </h2>
          <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-card">
            {produtos.map((prod) => (
              <li
                key={prod.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <div className="text-base font-medium">{prod.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatBRL(prod.preco)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const novos = produtos.map((p) =>
                        p.id === prod.id
                          ? { ...p, estoque: Math.max(0, p.estoque - 1) }
                          : p,
                      );
                      setProdutos(novos);
                    }}
                    className="h-9 w-9 rounded-md border border-border bg-background text-lg hover:bg-surface"
                    aria-label="Diminuir"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-base font-semibold tabular-nums">
                    {prod.estoque}
                  </span>
                  <button
                    onClick={() => {
                      const novos = produtos.map((p) =>
                        p.id === prod.id ? { ...p, estoque: p.estoque + 1 } : p,
                      );
                      setProdutos(novos);
                    }}
                    className="h-9 w-9 rounded-md border border-border bg-background text-lg hover:bg-surface"
                    aria-label="Aumentar"
                  >
                    +
                  </button>
                  {prod.estoque === 0 && (
                    <span className="ml-2 rounded-sm bg-destructive/10 px-2 py-1 text-xs text-destructive">
                      Esgotado · oculto do catálogo
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function PedidoCard({ pedido }: { pedido: Pedido }) {
  const data = new Date(pedido.criadoEm).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  function mover(direcao: 1 | -1) {
    const idx = COLUNAS.findIndex((c) => c.id === pedido.status);
    const next = idx + direcao;
    if (next < 0 || next >= COLUNAS.length) return;
    atualizar({ ...pedido, status: COLUNAS[next].id });
  }
  function togglePago() {
    atualizar({ ...pedido, pago: !pedido.pago });
  }
  function atualizar(p: Pedido) {
    const lista = getPedidos().map((x) => (x.id === p.id ? p : x));
    setPedidos(lista);
  }

  return (
    <article className="rounded-md border border-border bg-card p-3 text-sm">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium">{pedido.nome}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {pedido.id}
        </span>
      </div>
      <div className="mt-0.5 text-xs text-muted-foreground">
        {pedido.tipo} · {data}
      </div>
      <ul className="mt-2 space-y-0.5 text-xs">
        {pedido.itens.map((it, i) => (
          <li key={i}>
            {it.kind === "pronta"
              ? `• ${it.nome}${it.qty > 1 ? ` ×${it.qty}` : ""}`
              : `• ${it.tipo} (${it.esmalte}) "${it.descricao}"`}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold">{formatBRL(pedido.total)}</span>
        <span
          className={
            pedido.pago
              ? "rounded-sm bg-primary/15 px-1.5 py-0.5 text-primary"
              : "rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground"
          }
        >
          {pedido.pago ? "Pago" : "Aguardando"}
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
          {pedido.pago ? "Desmarcar pago" : "Marcar pago"}
        </button>
        <a
          href={whatsappLink(pedido.whatsapp)}
          target="_blank"
          rel="noreferrer"
          className="rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          WhatsApp
        </a>
      </div>
    </article>
  );
}
