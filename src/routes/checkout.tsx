import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/Header";
import {
  cartPrazo,
  cartTotal,
  finalizarPedido,
  formatBRL,
  getCart,
  removeFromCart,
  useStore,
} from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Meu pedido — Ateliê Barro" },
      { name: "description", content: "Resumo e fechamento do pedido." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const cart = useStore(getCart);
  const [nome, setNome] = useState("");
  const [whats, setWhats] = useState("");
  const [erro, setErro] = useState("");

  const total = cartTotal(cart);
  const prazo = cartPrazo(cart);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !whats.trim()) {
      setErro("Preencha nome e WhatsApp para enviar o pedido.");
      return;
    }
    if (cart.length === 0) {
      setErro("Seu pedido está vazio.");
      return;
    }
    const pedido = finalizarPedido(nome.trim(), whats.trim());
    navigate({ to: "/sucesso", search: { id: pedido.id } });
  }

  if (cart.length === 0) {
    return (
      <PageContainer>
        <h1 className="text-xl font-semibold">Meu pedido</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você ainda não adicionou nenhuma peça.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/pecas"
            className="rounded-md bg-primary px-4 py-3 text-center text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            Ver peças disponíveis
          </Link>
          <Link
            to="/personalizado"
            className="rounded-md border border-border bg-card px-4 py-3 text-center text-base font-medium hover:bg-surface"
          >
            Encomendar personalizado
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Resumo do pedido</h1>

      <ul className="mt-4 divide-y divide-border rounded-md border border-border bg-card">
        {cart.map((it, idx) => (
          <li key={idx} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              {it.kind === "pronta" ? (
                <>
                  <div className="text-base font-medium">
                    {it.nome}
                    {it.qty > 1 && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        × {it.qty}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Pronta entrega</div>
                </>
              ) : (
                <>
                  <div className="text-base font-medium">
                    {it.tipo} personalizada
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Esmalte {it.esmalte} · {it.prazoDias} dias
                  </div>
                  <div className="mt-1 text-sm">"{it.descricao}"</div>
                </>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-base font-semibold">
                {formatBRL(it.kind === "pronta" ? it.preco * it.qty : it.preco)}
              </span>
              <button
                type="button"
                onClick={() => removeFromCart(idx)}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-md border border-border bg-surface p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-xl font-semibold">{formatBRL(total)}</span>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Prazo de produção</span>
          <span className="rounded-sm bg-primary px-2 py-1 text-sm font-medium text-primary-foreground">
            {prazo} dias úteis
          </span>
        </div>
      </div>

      <form onSubmit={enviar} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-sm font-medium">Nome</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-input bg-card px-3 py-3 text-base outline-none focus:border-primary"
            placeholder="Seu nome"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">WhatsApp</span>
          <input
            type="tel"
            value={whats}
            onChange={(e) => setWhats(e.target.value)}
            required
            inputMode="tel"
            className="mt-1 w-full rounded-md border border-input bg-card px-3 py-3 text-base outline-none focus:border-primary"
            placeholder="(11) 99999-9999"
          />
        </label>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          Enviar pedido
        </button>
      </form>
    </PageContainer>
  );
}
