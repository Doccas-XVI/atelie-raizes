import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContainer } from "@/components/Header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ateliê Raízes — cerâmica artesanal" },
      {
        name: "description",
        content:
          "Peças de cerâmica feitas à mão. Pronta entrega, encomendas personalizadas e o processo por trás de cada peça.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageContainer>
      <section className="pb-6">
        <h1 className="text-2xl font-semibold leading-tight">
          Cerâmica feita à mão, peça por peça.
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Escolha uma peça pronta, encomende algo personalizado ou entenda como
          tudo é feito antes de perguntar o preço.
        </p>
      </section>

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
          subtitle="Por que esse preço? Cada etapa explicada"
          variant="primary"
        />
      </nav>

      <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
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
  variant = "default",
}: {
  to: string;
  title: string;
  subtitle: string;
  variant?: "default" | "primary";
}) {
  const base =
    "block rounded-md border px-4 py-5 text-left transition-colors";
  const styles =
    variant === "primary"
      ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
      : "border-border bg-card hover:bg-surface";
  return (
    <Link to={to} className={`${base} ${styles}`}>
      <div className="text-base font-medium">{title}</div>
      <div
        className={`mt-1 text-sm ${
          variant === "primary" ? "text-primary-foreground/85" : "text-muted-foreground"
        }`}
      >
        {subtitle}
      </div>
    </Link>
  );
}
