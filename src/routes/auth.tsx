import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Entrar — Ateliê Raízes" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao entrar";
      setErro(
        msg.includes("Invalid login")
          ? "Email ou senha incorretos."
          : msg.includes("already registered")
            ? "Esse email já tem cadastro. Use Entrar."
            : msg,
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 block text-sm text-muted-foreground hover:underline">
          ← Voltar ao site
        </Link>
        <form
          onSubmit={submit}
          className="rounded-md border border-border bg-card p-5"
        >
          <h1 className="text-lg font-semibold">Painel da Artesã</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre com seu email e senha."
              : "Cadastre seu acesso. O primeiro cadastro vira o administrador do ateliê."}
          </p>

          <div className="mt-4 flex gap-2 rounded-md bg-surface p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded px-3 py-1.5 ${
                mode === "login" ? "bg-card font-medium shadow-sm" : "text-muted-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded px-3 py-1.5 ${
                mode === "signup" ? "bg-card font-medium shadow-sm" : "text-muted-foreground"
              }`}
            >
              Criar acesso
            </button>
          </div>

          <label className="mt-4 block text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className="font-medium">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base outline-none focus:border-primary"
            />
          </label>
          {erro && <p className="mt-3 text-sm text-destructive">{erro}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {carregando ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar acesso"}
          </button>
        </form>
      </div>
    </div>
  );
}
