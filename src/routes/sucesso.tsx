import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/Header";

export const Route = createFileRoute("/sucesso")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Pedido enviado — Ateliê Barro" },
      { name: "description", content: "Pedido recebido. Próximos passos." },
    ],
  }),
  component: Sucesso,
});

function Sucesso() {
  const { id } = Route.useSearch();

  return (
    <PageContainer>
      <div className="rounded-md border border-primary bg-primary/5 p-5">
        <h1 className="text-xl font-semibold">Pedido enviado ✓</h1>
        <p className="mt-2 text-sm">
          Número do pedido: <span className="font-mono font-medium">{id}</span>
        </p>
      </div>

      <section className="mt-6">
        <h2 className="text-base font-medium">Próximos passos</h2>
        <ol className="mt-3 space-y-3 text-sm leading-relaxed">
          <Step n={1}>
            Em até 24h você recebe uma mensagem no WhatsApp confirmando o pedido
            e enviando os dados para pagamento.
          </Step>
          <Step n={2}>
            Personalizados: 50% na confirmação, 50% antes do envio. Pronta
            entrega: pagamento integral.
          </Step>
          <Step n={3}>
            Após o pagamento, produção entra na fila. Você acompanha o status
            pelo WhatsApp.
          </Step>
          <Step n={4}>
            Quando a peça estiver pronta, combinamos envio ou retirada.
          </Step>
        </ol>
      </section>

      <Link
        to="/"
        className="mt-8 inline-block rounded-md border border-border bg-card px-4 py-3 text-base font-medium hover:bg-surface"
      >
        Voltar ao início
      </Link>
    </PageContainer>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
