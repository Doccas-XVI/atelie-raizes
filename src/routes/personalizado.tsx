import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/Header";
import {
  formatBRL,
  getCart,
  setCart,
  useEsmaltes,
  useTipos,
} from "@/lib/api";

export const Route = createFileRoute("/personalizado")({
  head: () => ({
    meta: [
      { title: "Encomendar personalizado — Ateliê Raízes" },
      {
        name: "description",
        content: "Monte sua peça personalizada: tipo, esmalte e descrição.",
      },
    ],
  }),
  component: Personalizado,
});

function Personalizado() {
  const navigate = useNavigate();
  const { data: tipos = [] } = useTipos();
  const { data: esmaltes = [] } = useEsmaltes();
  const [tipoId, setTipoId] = useState<string>("");
  const [esmalteId, setEsmalteId] = useState<string>("");
  const [descricao, setDescricao] = useState("");

  const tipo = tipos.find((t) => t.id === tipoId);
  const esmalte = esmaltes.find((e) => e.id === esmalteId);
  const podeAdicionar = !!tipo && !!esmalte;

  function adicionar() {
    if (!tipo || !esmalte) return;
    const cart = getCart();
    setCart([
      ...cart,
      {
        kind: "personalizado",
        cart_id: `C${Date.now().toString(36)}`,
        tipo_id: tipo.id,
        tipo_nome: tipo.nome,
        preco: Number(tipo.preco_base),
        esmalte_id: esmalte.id,
        esmalte_nome: esmalte.nome,
        descricao: descricao.trim() || "(sem texto/desenho)",
        prazo_dias: tipo.prazo_dias,
      },
    ]);
    navigate({ to: "/checkout" });
  }

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Encomenda personalizada</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Três passos. O prazo aparece conforme você escolhe.
      </p>

      <Step n={1} title="Tipo de peça">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {tipos.map((t) => {
            const ativo = tipoId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipoId(t.id)}
                className={`flex flex-col rounded-md border p-3 text-left transition-colors ${
                  ativo ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-surface"
                }`}
              >
                <div className="flex h-20 items-center justify-center rounded-sm bg-surface text-2xl font-light text-muted-foreground">
                  {t.nome.charAt(0).toUpperCase()}
                </div>
                <div className="mt-2 text-sm font-medium">{t.nome}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBRL(t.preco_min)}–{formatBRL(t.preco_max)}
                </div>
              </button>
            );
          })}
        </div>
      </Step>

      <Step n={2} title="Cor / esmalte">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {esmaltes.map((e) => {
            const ativo = esmalteId === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEsmalteId(e.id)}
                className={`flex flex-col items-center gap-1.5 rounded-md border p-2 transition-colors ${
                  ativo ? "border-primary" : "border-border hover:bg-surface"
                }`}
                aria-pressed={ativo}
              >
                {e.foto_url ? (
                  <img
                    src={e.foto_url}
                    alt={e.nome}
                    className="h-12 w-12 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span
                    className="block h-12 w-12 rounded-full border border-border"
                    style={{ backgroundColor: e.cor_hex }}
                    aria-hidden
                  />
                )}
                <span className="text-center text-xs leading-tight">{e.nome}</span>
              </button>
            );
          })}
        </div>
      </Step>

      <Step n={3} title="O que quer escrito ou desenhado?">
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={4}
          placeholder='Ex: "Bom dia, sol" em letra cursiva, ou um desenho de folha.'
          className="w-full resize-none rounded-md border border-input bg-card p-3 text-base outline-none focus:border-primary"
        />
      </Step>

      {tipo && (
        <div className="mt-6 rounded-md border border-border bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Preço estimado</span>
            <span className="text-lg font-semibold">{formatBRL(tipo.preco_base)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Prazo de produção</span>
            <span className="text-base font-medium">{tipo.prazo_dias} dias úteis</span>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!podeAdicionar}
        onClick={adicionar}
        className="mt-6 w-full rounded-md bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Adicionar ao pedido
      </button>
    </PageContainer>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
