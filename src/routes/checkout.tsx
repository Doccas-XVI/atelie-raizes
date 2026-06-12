import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/components/Header";
import {
  cartPrazo,
  cartTotal,
  finalizarPedido,
  formatBRL,
  removeFromCart,
  useCart,
} from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Meu pedido — Ateliê Raízes" },
      { name: "description", content: "Resumo e fechamento do pedido." },
    ],
  }),
  component: Checkout,
});

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function Checkout() {
  const navigate = useNavigate();
  const cart = useCart();
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    email: "",
    cep: "",
    endereco: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const total = cartTotal(cart);
  const prazo = cartPrazo(cart);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function buscarCep(cepRaw: string) {
    const cep = cepRaw.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (!d.erro) {
        setForm((f) => ({
          ...f,
          endereco: d.logradouro
            ? `${d.logradouro}${d.bairro ? " — " + d.bairro : ""}`
            : f.endereco,
          cidade: d.localidade ?? f.cidade,
          estado: d.uf ?? f.estado,
        }));
      }
    } catch {
      /* silencioso */
    } finally {
      setBuscandoCep(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!form.nome.trim() || !form.whatsapp.trim()) {
      setErro("Preencha nome e WhatsApp para enviar o pedido.");
      return;
    }
    if (cart.length === 0) {
      setErro("Seu pedido está vazio.");
      return;
    }
    setEnviando(true);
    try {
      const pedido = await finalizarPedido({
        nome: form.nome.trim(),
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim(),
        cep: form.cep.trim(),
        endereco: form.endereco.trim(),
        cidade: form.cidade.trim(),
        estado: form.estado.trim(),
        observacoes: form.observacoes.trim(),
      });
      navigate({ to: "/sucesso", search: { id: pedido.codigo } });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar pedido.");
    } finally {
      setEnviando(false);
    }
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
                      <span className="ml-2 text-sm text-muted-foreground">× {it.qty}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Pronta entrega</div>
                </>
              ) : (
                <>
                  <div className="text-base font-medium">{it.tipo_nome} personalizada</div>
                  <div className="text-xs text-muted-foreground">
                    Esmalte {it.esmalte_nome} · {it.prazo_dias} dias
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

      <form onSubmit={enviar} className="mt-6 space-y-4">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Contato
          </legend>
          <Input label="Nome *" value={form.nome} onChange={(v) => set("nome", v)} required minLength={2} maxLength={120} placeholder="Seu nome" />
          <Input label="WhatsApp *" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} required minLength={8} maxLength={30} placeholder="(11) 99999-9999" type="tel" />
          <Input label="Email (opcional)" value={form.email} onChange={(v) => set("email", v)} maxLength={120} placeholder="voce@email.com" type="email" />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Endereço de entrega (opcional)
          </legend>
          <Input
            label={buscandoCep ? "CEP (buscando…)" : "CEP"}
            value={form.cep}
            onChange={(v) => {
              set("cep", v);
              if (v.replace(/\D/g, "").length === 8) buscarCep(v);
            }}
            maxLength={9}
            placeholder="00000-000"
            inputMode="numeric"
          />
          <Input label="Endereço e bairro" value={form.endereco} onChange={(v) => set("endereco", v)} maxLength={200} placeholder="Rua, número, bairro" />
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Input label="Cidade" value={form.cidade} onChange={(v) => set("cidade", v)} maxLength={80} />
            <label className="block text-sm">
              <span className="font-medium">UF</span>
              <select
                value={form.estado}
                onChange={(e) => set("estado", e.target.value)}
                className="mt-1 h-[46px] w-full rounded-md border border-input bg-card px-2 text-base outline-none focus:border-primary"
              >
                <option value="">—</option>
                {UFS.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <label className="block text-sm">
          <span className="font-medium">Observações (opcional)</span>
          <textarea
            value={form.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Algo que a artesã precisa saber?"
            className="mt-1 w-full rounded-md border border-input bg-card px-3 py-3 text-base outline-none focus:border-primary"
          />
        </label>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-md bg-primary px-4 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar pedido"}
        </button>
      </form>
    </PageContainer>
  );
}

function Input({
  label, value, onChange, type = "text", required, minLength, maxLength, placeholder, inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        inputMode={inputMode}
        className="mt-1 w-full rounded-md border border-input bg-card px-3 py-3 text-base outline-none focus:border-primary"
      />
    </label>
  );
}
