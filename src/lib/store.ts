// Simple localStorage-based store for the prototype
import { useEffect, useState } from "react";

export type Product = {
  id: string;
  nome: string;
  preco: number;
  estoque: number;
  comoEFeita: string;
  emoji: string;
};

export type Esmalte = {
  id: string;
  nome: string;
  cor: string; // CSS color for swatch
};

export type CartItem =
  | { kind: "pronta"; productId: string; nome: string; preco: number; qty: number }
  | {
      kind: "personalizado";
      id: string;
      tipo: string;
      preco: number;
      esmalte: string;
      descricao: string;
      prazoDias: number;
    };

export type Pedido = {
  id: string;
  nome: string;
  whatsapp: string;
  itens: CartItem[];
  total: number;
  prazoDias: number;
  status: "novos" | "producao" | "prontos" | "entregues";
  pago: boolean;
  criadoEm: number;
  tipo: "Pronta Entrega" | "Personalizado" | "Misto";
};

export const PRODUTOS_INICIAIS: Product[] = [
  {
    id: "caneca",
    nome: "Caneca",
    preco: 120,
    estoque: 6,
    emoji: "☕",
    comoEFeita:
      "Modelada à mão em torno elétrico com cerca de 350g de argila. Passa por secagem lenta de 5 dias, primeira queima a 950°C, esmaltação manual e segunda queima a 1230°C.",
  },
  {
    id: "copinho",
    nome: "Copinho de Café",
    preco: 55,
    estoque: 12,
    emoji: "🥃",
    comoEFeita:
      "Peça pequena torneada à mão, parede fina exige técnica apurada. Duas queimas e esmalte alimentar aplicado por imersão. Cada copinho leva cerca de 8 dias até ficar pronto.",
  },
  {
    id: "boleira-p",
    nome: "Boleira P",
    preco: 162,
    estoque: 3,
    emoji: "🍰",
    comoEFeita:
      "Base e prato modelados separadamente e unidos antes da primeira queima. Esmalte aplicado em duas camadas para garantir o brilho. Processo completo leva 14 dias.",
  },
  {
    id: "jarra-caneca",
    nome: "Conjunto Jarra e Caneca",
    preco: 290,
    estoque: 2,
    emoji: "🫖",
    comoEFeita:
      "Conjunto torneado no mesmo lote para garantir tom uniforme do esmalte. Alça da jarra modelada à mão e fixada antes da secagem. Duas queimas e controle de pares.",
  },
  {
    id: "cinzeiro",
    nome: "Cinzeiro",
    preco: 45,
    estoque: 8,
    emoji: "🪨",
    comoEFeita:
      "Modelado com técnica de placa, bordas alisadas à mão. Esmalte resistente a altas temperaturas. Cada peça é única em formato e tonalidade.",
  },
];

export const ESMALTES: Esmalte[] = [
  { id: "terra", nome: "Terra Queimada", cor: "#8B5A3C" },
  { id: "areia", nome: "Areia", cor: "#C9B79C" },
  { id: "oliva", nome: "Verde Oliva", cor: "#6B7A3E" },
  { id: "azul", nome: "Azul Profundo", cor: "#3B5A7A" },
  { id: "vermelho", nome: "Vermelho Telha", cor: "#A04A35" },
  { id: "cru", nome: "Cru Fosco", cor: "#E8DCC4" },
];

export const TIPOS_PERSONALIZADO = [
  { id: "caneca", nome: "Caneca", precoMin: 140, precoMax: 180, preco: 160, prazoDias: 25 },
  { id: "prato", nome: "Prato", precoMin: 110, precoMax: 160, preco: 135, prazoDias: 22 },
  { id: "bowl", nome: "Bowl", precoMin: 120, precoMax: 170, preco: 145, prazoDias: 22 },
];

// Storage helpers
const KEY_PROD = "atelie.produtos.v1";
const KEY_CART = "atelie.cart.v1";
const KEY_PEDIDOS = "atelie.pedidos.v1";
const KEY_ADMIN = "atelie.admin.v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("atelie:update", { detail: key }));
}

export function getProdutos(): Product[] {
  return read<Product[]>(KEY_PROD, PRODUTOS_INICIAIS);
}
export function setProdutos(p: Product[]) {
  write(KEY_PROD, p);
}

export function getCart(): CartItem[] {
  return read<CartItem[]>(KEY_CART, []);
}
export function setCart(c: CartItem[]) {
  write(KEY_CART, c);
}

export function getPedidos(): Pedido[] {
  return read<Pedido[]>(KEY_PEDIDOS, []);
}
export function setPedidos(p: Pedido[]) {
  write(KEY_PEDIDOS, p);
}

export function isAdminAuth(): boolean {
  return read<boolean>(KEY_ADMIN, false);
}
export function setAdminAuth(v: boolean) {
  write(KEY_ADMIN, v);
}

// React hook for reactive subscription
export function useStore<T>(getter: () => T): T {
  const [value, setValue] = useState<T>(() => getter());
  useEffect(() => {
    const handler = () => setValue(getter());
    setValue(getter());
    window.addEventListener("atelie:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("atelie:update", handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((acc, it) => {
    if (it.kind === "pronta") return acc + it.preco * it.qty;
    return acc + it.preco;
  }, 0);
}

export function cartPrazo(items: CartItem[]): number {
  let max = 0;
  for (const it of items) {
    if (it.kind === "pronta") max = Math.max(max, 3);
    else max = Math.max(max, it.prazoDias);
  }
  return max;
}

export function addProntaToCart(p: Product) {
  const cart = getCart();
  const existing = cart.find(
    (i) => i.kind === "pronta" && i.productId === p.id,
  ) as Extract<CartItem, { kind: "pronta" }> | undefined;
  if (existing) {
    existing.qty += 1;
    setCart([...cart]);
  } else {
    setCart([
      ...cart,
      { kind: "pronta", productId: p.id, nome: p.nome, preco: p.preco, qty: 1 },
    ]);
  }
}

export function removeFromCart(index: number) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart([...cart]);
}

export function finalizarPedido(nome: string, whatsapp: string): Pedido {
  const itens = getCart();
  const total = cartTotal(itens);
  const prazoDias = cartPrazo(itens);
  const temPronta = itens.some((i) => i.kind === "pronta");
  const temPerso = itens.some((i) => i.kind === "personalizado");
  const tipo: Pedido["tipo"] =
    temPronta && temPerso
      ? "Misto"
      : temPerso
        ? "Personalizado"
        : "Pronta Entrega";

  const pedido: Pedido = {
    id: `P${Date.now().toString(36).toUpperCase()}`,
    nome,
    whatsapp,
    itens,
    total,
    prazoDias,
    status: "novos",
    pago: false,
    criadoEm: Date.now(),
    tipo,
  };

  // Decrement stock
  const produtos = getProdutos();
  for (const it of itens) {
    if (it.kind === "pronta") {
      const prod = produtos.find((p) => p.id === it.productId);
      if (prod) prod.estoque = Math.max(0, prod.estoque - it.qty);
    }
  }
  setProdutos([...produtos]);

  setPedidos([pedido, ...getPedidos()]);
  setCart([]);
  return pedido;
}

export function whatsappLink(numero: string): string {
  const limpo = numero.replace(/\D/g, "");
  return `https://wa.me/55${limpo}`;
}
