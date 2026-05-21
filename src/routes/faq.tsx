import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/Header";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Dúvidas frequentes — Ateliê Raízes" },
      {
        name: "description",
        content: "Respostas diretas para as perguntas mais comuns sobre as peças e o atendimento.",
      },
    ],
  }),
  component: FAQ,
});

const PERGUNTAS = [
  {
    q: "Quanto tempo demora um pedido personalizado?",
    a: "Entre 22 e 25 dias úteis, dependendo do tipo de peça. O prazo aparece automaticamente quando você monta o pedido.",
  },
  {
    q: "E peças de pronta entrega?",
    a: "Saem do ateliê em até 3 dias úteis após a confirmação do pagamento.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "PIX ou transferência. Para personalizados, 50% na confirmação e 50% antes do envio. Pronta entrega: pagamento integral à vista.",
  },
  {
    q: "Vocês enviam para todo o Brasil?",
    a: "Sim. Frete por Correios ou transportadora, calculado pelo CEP. Embalagem reforçada com plástico bolha e caixa dupla.",
  },
  {
    q: "Posso escolher o esmalte?",
    a: "Sim, em peças personalizadas. As cores disponíveis aparecem com foto real na aba de encomendas.",
  },
  {
    q: "E se a peça quebrar no transporte?",
    a: "Envie uma foto da embalagem e da peça em até 48h. Reembolsamos ou refazemos sem custo adicional.",
  },
  {
    q: "Posso pedir um modelo que não está no catálogo?",
    a: "Sim, chame no WhatsApp com referência visual. Avaliamos viabilidade e prazo caso a caso.",
  },
  {
    q: "Posso ir buscar pessoalmente?",
    a: "Sim, retirada combinada por WhatsApp. Sem custo de frete nesse caso.",
  },
  {
    q: "As peças vão na máquina de lavar / micro-ondas?",
    a: "Micro-ondas sim. Lava-louças: melhor lavar à mão para preservar o esmalte por mais tempo.",
  },
  {
    q: "Faz lembrancinhas em quantidade?",
    a: "Sim, a partir de 20 unidades. Prazo mínimo de 45 dias. Peça um orçamento no WhatsApp.",
  },
];

function FAQ() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Dúvidas frequentes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clique na pergunta para ver a resposta.
      </p>

      <ul className="mt-5 divide-y divide-border rounded-md border border-border bg-card">
        {PERGUNTAS.map((p, i) => {
          const open = aberta === i;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setAberta(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-base hover:bg-surface"
                aria-expanded={open}
              >
                <span className="font-medium">{p.q}</span>
                <span
                  className="text-muted-foreground"
                  aria-hidden
                >
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-foreground/85">
                  {p.a}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
