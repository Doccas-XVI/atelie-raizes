import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/Header";

export const Route = createFileRoute("/processo")({
  head: () => ({
    meta: [
      { title: "Por que esse preço? — Ateliê Raízes" },
      {
        name: "description",
        content:
          "O processo artesanal completo, etapa por etapa. Entenda o tempo e o trabalho por trás de cada peça.",
      },
    ],
  }),
  component: Processo,
});

const ETAPAS = [
  {
    n: 1,
    icon: "✋",
    titulo: "Modelagem à mão",
    texto:
      "Cada peça começa em torno ou em placa, modelada uma a uma. Não existem dois exemplares idênticos.",
  },
  {
    n: 2,
    icon: "🌬️",
    titulo: "Secagem",
    texto:
      "De 3 a 7 dias em ambiente controlado. Apressar essa etapa significa trincar a peça inteira.",
  },
  {
    n: 3,
    icon: "🔥",
    titulo: "Primeira queima (biscoito)",
    texto:
      "12 horas no forno a 950°C. A peça endurece e fica pronta para receber o esmalte.",
  },
  {
    n: 4,
    icon: "🎨",
    titulo: "Esmaltação",
    texto:
      "Esmalte aplicado à mão, por imersão ou pincel. É aqui que a cor final é definida.",
  },
  {
    n: 5,
    icon: "🔥",
    titulo: "Segunda queima",
    texto:
      "Mais 14 horas a 1230°C. O esmalte vitrifica e a peça se torna durável e impermeável.",
  },
  {
    n: 6,
    icon: "🔍",
    titulo: "Controle de qualidade",
    texto:
      "Peças com defeito vão fora. Só sai do ateliê o que passa em uma checagem manual.",
  },
];

function Processo() {
  return (
    <PageContainer>
      <h1 className="text-xl font-semibold">Por que esse preço?</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Sem rodeios: aqui está cada etapa pela qual uma peça passa antes de
        chegar até você.
      </p>

      <ol className="mt-6 space-y-3">
        {ETAPAS.map((e) => (
          <li
            key={e.n}
            className="flex gap-4 rounded-md border border-border bg-card p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface text-2xl">
              <span aria-hidden>{e.icon}</span>
            </div>
            <div>
              <h2 className="text-base font-medium">
                <span className="text-muted-foreground">{e.n}.</span> {e.titulo}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-foreground/85">
                {e.texto}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-md border-l-4 border-primary bg-surface p-4">
        <p className="text-base font-medium leading-relaxed">
          Cada peça leva em média 18 dias e passa por 6 etapas. Não é
          industrializado — é feito por uma pessoa, do zero.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/pecas"
          className="flex-1 rounded-md bg-primary px-4 py-3 text-center text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          Ver peças disponíveis
        </Link>
        <Link
          to="/personalizado"
          className="flex-1 rounded-md border border-border bg-card px-4 py-3 text-center text-base font-medium hover:bg-surface"
        >
          Encomendar personalizado
        </Link>
      </div>
    </PageContainer>
  );
}
