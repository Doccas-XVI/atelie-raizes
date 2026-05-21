import { Link } from "@tanstack/react-router";
import { useStore, getCart } from "@/lib/store";

export function Header() {
  const cart = useStore(getCart);
  const count = cart.reduce((a, i) => a + (i.kind === "pronta" ? i.qty : 1), 0);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-base font-semibold tracking-tight">Ateliê Barro</span>
          <span className="text-xs text-muted-foreground">cerâmica artesanal</span>
        </Link>
        <Link
          to="/checkout"
          className="relative inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface"
        >
          Pedido
          {count > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
