// Supabase-backed data layer for Ateliê Raízes.
// Cart still lives in localStorage (per-visitor, pre-checkout state).
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// ============ Types ============
export type Produto = Database["public"]["Tables"]["produtos"]["Row"];
export type Esmalte = Database["public"]["Tables"]["esmaltes"]["Row"];
export type TipoPersonalizado = Database["public"]["Tables"]["tipos_personalizado"]["Row"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type FAQ = Database["public"]["Tables"]["faq"]["Row"];
export type PedidoRow = Database["public"]["Tables"]["pedidos"]["Row"];
export type Cliente = Database["public"]["Tables"]["clientes"]["Row"];
export type PedidoItem = Database["public"]["Tables"]["pedido_itens"]["Row"];
export type Pagamento = Database["public"]["Tables"]["pagamentos"]["Row"];
export type PedidoCompleto = PedidoRow & {
  cliente: Cliente | null;
  itens: PedidoItem[];
  pagamentos: Pagamento[];
};

// ============ Cart (localStorage) ============
export type CartItem =
  | { kind: "pronta"; produto_id: string; nome: string; preco: number; qty: number }
  | {
      kind: "personalizado";
      cart_id: string;
      tipo_id: string;
      tipo_nome: string;
      preco: number;
      esmalte_id: string;
      esmalte_nome: string;
      descricao: string;
      prazo_dias: number;
    };

const CART_KEY = "atelie.cart.v2";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
  } catch {
    return [];
  }
}
export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("atelie:cart"));
}
export function useCart(): CartItem[] {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(getCart());
    sync();
    window.addEventListener("atelie:cart", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("atelie:cart", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}
export function addProntaToCart(p: { id: string; nome: string; preco: number | string }) {
  const cart = getCart();
  const ex = cart.find((i) => i.kind === "pronta" && i.produto_id === p.id) as
    | Extract<CartItem, { kind: "pronta" }>
    | undefined;
  if (ex) {
    ex.qty += 1;
    setCart([...cart]);
  } else {
    setCart([
      ...cart,
      { kind: "pronta", produto_id: p.id, nome: p.nome, preco: Number(p.preco), qty: 1 },
    ]);
  }
}
export function removeFromCart(idx: number) {
  const cart = getCart();
  cart.splice(idx, 1);
  setCart([...cart]);
}
export function cartTotal(items: CartItem[]): number {
  return items.reduce(
    (a, it) => a + (it.kind === "pronta" ? it.preco * it.qty : it.preco),
    0,
  );
}
export function cartPrazo(items: CartItem[]): number {
  return items.reduce(
    (m, it) => Math.max(m, it.kind === "pronta" ? 3 : it.prazo_dias),
    0,
  );
}

// ============ Helpers ============
export function formatBRL(n: number | string): string {
  return Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
export function whatsappLink(numero: string): string {
  return `https://wa.me/55${numero.replace(/\D/g, "")}`;
}

// ============ Catalog hooks ============
export function useProdutosPublicos() {
  return useQuery({
    queryKey: ["produtos", "publico"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .is("excluido_em", null)
        .gt("estoque", 0)
        .order("ordem");
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useProdutosAdmin() {
  return useQuery({
    queryKey: ["produtos", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .is("excluido_em", null)
        .order("ordem");
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useEsmaltes(soAtivos = true) {
  return useQuery({
    queryKey: ["esmaltes", soAtivos],
    queryFn: async () => {
      let q = supabase.from("esmaltes").select("*").order("ordem");
      if (soAtivos) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useTipos(soAtivos = true) {
  return useQuery({
    queryKey: ["tipos", soAtivos],
    queryFn: async () => {
      let q = supabase.from("tipos_personalizado").select("*").order("ordem");
      if (soAtivos) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useFAQ(soAtivos = true) {
  return useQuery({
    queryKey: ["faq", soAtivos],
    queryFn: async () => {
      let q = supabase.from("faq").select("*").order("ordem");
      if (soAtivos) q = q.eq("ativo", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
export function useConfig<T = Record<string, unknown>>(chave: string) {
  return useQuery({
    queryKey: ["config", chave],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_site")
        .select("valor")
        .eq("chave", chave)
        .maybeSingle();
      if (error) throw error;
      return (data?.valor as T) ?? ({} as T);
    },
  });
}

// ============ Pedidos ============
export function usePedidos() {
  return useQuery({
    queryKey: ["pedidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*, cliente:clientes(*), itens:pedido_itens(*), pagamentos(*)")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as PedidoCompleto[];
    },
  });
}

export function pagoStatus(p: PedidoCompleto): "pago" | "parcial" | "aguardando" {
  const pago = (p.pagamentos || [])
    .filter((x) => x.status === "pago")
    .reduce((a, x) => a + Number(x.valor), 0);
  if (pago <= 0) return "aguardando";
  if (pago >= Number(p.total)) return "pago";
  return "parcial";
}

export async function finalizarPedido(
  nome: string,
  whatsapp: string,
): Promise<{ id: string; codigo: string }> {
  const itens = getCart();
  if (itens.length === 0) throw new Error("Carrinho vazio");
  const total = cartTotal(itens);
  const prazo = cartPrazo(itens);
  const temPronta = itens.some((i) => i.kind === "pronta");
  const temPerso = itens.some((i) => i.kind === "personalizado");
  const tipo: Database["public"]["Enums"]["pedido_tipo"] =
    temPronta && temPerso ? "Misto" : temPerso ? "Personalizado" : "Pronta Entrega";

  const { data: cliente, error: errC } = await supabase
    .from("clientes")
    .insert({ nome, whatsapp })
    .select("id")
    .single();
  if (errC) throw errC;

  const { data: pedido, error: errP } = await supabase
    .from("pedidos")
    .insert({ cliente_id: cliente.id, tipo, total, prazo_dias: prazo })
    .select("id, codigo")
    .single();
  if (errP) throw errP;

  const itensRows = itens.map((it) =>
    it.kind === "pronta"
      ? {
          pedido_id: pedido.id,
          kind: "pronta" as const,
          produto_id: it.produto_id,
          nome_snapshot: it.nome,
          qtd: it.qty,
          preco_unit: it.preco,
          prazo_dias: 3,
        }
      : {
          pedido_id: pedido.id,
          kind: "personalizado" as const,
          tipo_personalizado_id: it.tipo_id,
          esmalte_id: it.esmalte_id,
          nome_snapshot: `${it.tipo_nome} (${it.esmalte_nome})`,
          descricao: it.descricao,
          qtd: 1,
          preco_unit: it.preco,
          prazo_dias: it.prazo_dias,
        },
  );
  const { error: errI } = await supabase.from("pedido_itens").insert(itensRows);
  if (errI) throw errI;

  for (const it of itens) {
    if (it.kind === "pronta") {
      const { data: prod } = await supabase
        .from("produtos")
        .select("estoque")
        .eq("id", it.produto_id)
        .maybeSingle();
      if (prod) {
        const novo = Math.max(0, (prod.estoque ?? 0) - it.qty);
        await supabase.from("produtos").update({ estoque: novo }).eq("id", it.produto_id);
      }
    }
  }

  setCart([]);
  return pedido;
}
