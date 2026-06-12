import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/Header";
import {
  addProntaToCart,
  formatBRL,
  useProdutosPublicos,
  type Produto,
} from "@/lib/api";

export const Route = createFileRoute("/pecas")({
  head: () => ({
    meta: [
      { title: "Peças disponíveis — Ateliê Raízes" },
      {
        name: "description",
        content:
          "Catálogo de peças prontas para envio. Cada peça com explicação de como foi feita.",
      },
    ],
  }),
  component: Pecas,
});

function Pecas() {
  const { data: produtos = [], isLoading } = useProdutosPublicos();

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Pronta entrega</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isLoading
          ? "Carregando peças…"
          : `${produtos.length} ${produtos.length === 1 ? "peça disponível" : "peças disponíveis"}. Quando esgota, sai do catálogo.`}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {produtos.map((p) => (
          <Card key={p.id} produto={p} />
        ))}
        {!isLoading && produtos.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Sem estoque no momento. Veja a aba de encomendas personalizadas.
          </p>
        )}
      </div>
    </PageContainer>
  );
}

function Card({ produto }: { produto: Produto }) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const inicial = produto.nome.charAt(0).toUpperCase();

  return (
    <article className="flex flex-col rounded-md border border-border bg-card">
      <div className="flex h-40 items-center justify-center bg-surface text-4xl font-light text-muted-foreground">
        <span aria-hidden>{inicial}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-medium">{produto.nome}</h2>
          <span className="text-base font-semibold">{formatBRL(produto.preco)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {produto.estoque} em estoque
        </p>

        {produto.como_e_feita && (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-1 text-left text-sm font-medium text-primary underline-offset-4 hover:underline"
              aria-expanded={open}
            >
              {open ? "− Ocultar" : "+ Como essa peça é feita"}
            </button>
            {open && (
              <p className="rounded-sm bg-surface p-3 text-sm leading-relaxed text-foreground/85">
                {produto.como_e_feita}
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={() => {
            addProntaToCart({ id: produto.id, nome: produto.nome, preco: produto.preco });
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="mt-auto rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {added ? "Adicionado ✓" : "Adicionar ao pedido"}
        </button>
      </div>
    </article>
  );
}
