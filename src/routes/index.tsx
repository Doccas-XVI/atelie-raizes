import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/Header";
import hero1 from "@/assets/atelie-1.jpg.asset.json";
import hero5 from "@/assets/atelie-5.jpg.asset.json";
import hero6 from "@/assets/atelie-6.jpg.asset.json";
import hero4 from "@/assets/atelie-4.jpg.asset.json";
import hero3 from "@/assets/atelie-3.jpg.asset.json";
import hero2 from "@/assets/atelie-2.jpg.asset.json";
import hero7 from "@/assets/atelie-7.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ateliê Raízes — cerâmica artesanal" },
      {
        name: "description",
        content:
          "Peças de cerâmica feitas à mão. Pronta entrega, encomendas personalizadas e o processo por trás de cada peça.",
      },
      { property: "og:title", content: "Ateliê Raízes — cerâmica artesanal" },
      {
        property: "og:description",
        content:
          "Peças únicas, feitas à mão. Conheça o catálogo, encomende personalizados e entenda o processo.",
      },
      { property: "og:image", content: hero1.url },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageContainer>
      {/* Hero */}
      <section className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-[1.05fr_1fr] md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Ateliê Raízes
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-[1.1] sm:text-4xl">
            Cerâmica feita à mão,<br />peça por peça.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Escolha uma peça pronta, encomende algo personalizado ou entenda
            como tudo é feito antes de perguntar o preço.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/pecas"
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Ver peças disponíveis
            </Link>
            <Link
              to="/processo"
              className="rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-surface"
            >
              Por que esse preço?
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-surface">
          <img
            src={hero1.url}
            alt="Peça de cerâmica artesanal sobre tecido terracota"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Atalhos principais */}
      <section className="border-t border-border pt-6">
        <h2 className="sr-only">O que você precisa</h2>
        <nav className="flex flex-col gap-3">
          <BigButton
            to="/pecas"
            title="Ver peças disponíveis"
            subtitle="Pronta entrega, com estoque e preço visível"
          />
          <BigButton
            to="/personalizado"
            title="Encomendar personalizado"
            subtitle="Escolha tipo, esmalte e o que escrever na peça"
          />
          <BigButton
            to="/processo"
            title="Entender o processo"
            subtitle="Cada etapa explicada, da argila à queima"
          />
        </nav>
      </section>

      {/* Galeria */}
      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Do ateliê
        </h2>
        <p className="mt-2 text-base">
          Peças únicas — formas, esmaltes e cores que não se repetem.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[hero6, hero5, hero4, hero7, hero3, hero2].map((img, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-sm border border-border bg-surface"
            >
              <img
                src={img.url}
                alt="Peça de cerâmica do Ateliê Raízes"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex items-center gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
        <Link to="/faq" className="underline-offset-4 hover:underline">
          Tirar dúvidas
        </Link>
        <span aria-hidden>·</span>
        <Link to="/checkout" className="underline-offset-4 hover:underline">
          Meu pedido
        </Link>
      </div>
    </PageContainer>
  );
}

function BigButton({
  to,
  title,
  subtitle,
}: {
  to: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-md border border-border bg-card px-4 py-5 text-left transition-colors hover:bg-surface"
    >
      <div className="text-base font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
    </Link>
  );
}
