import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/Header";
import { useFAQ } from "@/lib/api";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Dúvidas frequentes — Ateliê Raízes" },
      {
        name: "description",
        content:
          "Respostas diretas para as perguntas mais comuns sobre as peças e o atendimento.",
      },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const { data: perguntas = [], isLoading } = useFAQ();
  const [aberta, setAberta] = useState<string | null>(null);

  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Dúvidas frequentes</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clique na pergunta para ver a resposta.
      </p>

      {isLoading && (
        <p className="mt-5 text-sm text-muted-foreground">Carregando…</p>
      )}

      <ul className="mt-5 divide-y divide-border rounded-md border border-border bg-card">
        {perguntas.map((p) => {
          const open = aberta === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setAberta(open ? null : p.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-base hover:bg-surface"
                aria-expanded={open}
              >
                <span className="font-medium">{p.pergunta}</span>
                <span className="text-muted-foreground" aria-hidden>
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-foreground/85">
                  {p.resposta}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PageContainer>
  );
}
