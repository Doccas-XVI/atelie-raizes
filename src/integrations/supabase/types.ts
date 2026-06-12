export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          criado_em: string
          id: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          atualizado_em: string
          cep: string | null
          cidade: string | null
          criado_em: string
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          origem: string | null
          telefone: string | null
          whatsapp: string
        }
        Insert: {
          atualizado_em?: string
          cep?: string | null
          cidade?: string | null
          criado_em?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem?: string | null
          telefone?: string | null
          whatsapp: string
        }
        Update: {
          atualizado_em?: string
          cep?: string | null
          cidade?: string | null
          criado_em?: string
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem?: string | null
          telefone?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      configuracoes_site: {
        Row: {
          atualizado_em: string
          chave: string
          valor: Json
        }
        Insert: {
          atualizado_em?: string
          chave: string
          valor?: Json
        }
        Update: {
          atualizado_em?: string
          chave?: string
          valor?: Json
        }
        Relationships: []
      }
      esmaltes: {
        Row: {
          ativo: boolean
          cor_hex: string
          criado_em: string
          foto_url: string | null
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          cor_hex: string
          criado_em?: string
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          cor_hex?: string
          criado_em?: string
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      faq: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          id: string
          ordem: number
          pergunta: string
          resposta: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          ordem?: number
          pergunta: string
          resposta: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          id?: string
          ordem?: number
          pergunta?: string
          resposta?: string
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          criado_em: string
          data: string
          forma: Database["public"]["Enums"]["pagamento_forma"]
          id: string
          observacao: string | null
          pedido_id: string
          status: Database["public"]["Enums"]["pagamento_status"]
          valor: number
        }
        Insert: {
          criado_em?: string
          data?: string
          forma: Database["public"]["Enums"]["pagamento_forma"]
          id?: string
          observacao?: string | null
          pedido_id: string
          status?: Database["public"]["Enums"]["pagamento_status"]
          valor: number
        }
        Update: {
          criado_em?: string
          data?: string
          forma?: Database["public"]["Enums"]["pagamento_forma"]
          id?: string
          observacao?: string | null
          pedido_id?: string
          status?: Database["public"]["Enums"]["pagamento_status"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          criado_em: string
          descricao: string | null
          esmalte_id: string | null
          id: string
          kind: Database["public"]["Enums"]["item_kind"]
          nome_snapshot: string
          pedido_id: string
          prazo_dias: number
          preco_unit: number
          produto_id: string | null
          qtd: number
          tipo_personalizado_id: string | null
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          esmalte_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["item_kind"]
          nome_snapshot: string
          pedido_id: string
          prazo_dias?: number
          preco_unit: number
          produto_id?: string | null
          qtd?: number
          tipo_personalizado_id?: string | null
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          esmalte_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["item_kind"]
          nome_snapshot?: string
          pedido_id?: string
          prazo_dias?: number
          preco_unit?: number
          produto_id?: string | null
          qtd?: number
          tipo_personalizado_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_esmalte_id_fkey"
            columns: ["esmalte_id"]
            isOneToOne: false
            referencedRelation: "esmaltes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_tipo_personalizado_id_fkey"
            columns: ["tipo_personalizado_id"]
            isOneToOne: false
            referencedRelation: "tipos_personalizado"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          atualizado_em: string
          cliente_id: string | null
          codigo: string
          criado_em: string
          data_desejada_entrega: string | null
          id: string
          observacoes: string | null
          prazo_dias: number
          status: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          total: number
        }
        Insert: {
          atualizado_em?: string
          cliente_id?: string | null
          codigo?: string
          criado_em?: string
          data_desejada_entrega?: string | null
          id?: string
          observacoes?: string | null
          prazo_dias?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          tipo: Database["public"]["Enums"]["pedido_tipo"]
          total?: number
        }
        Update: {
          atualizado_em?: string
          cliente_id?: string | null
          codigo?: string
          criado_em?: string
          data_desejada_entrega?: string | null
          id?: string
          observacoes?: string | null
          prazo_dias?: number
          status?: Database["public"]["Enums"]["pedido_status"]
          tipo?: Database["public"]["Enums"]["pedido_tipo"]
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      produto_fotos: {
        Row: {
          alt: string | null
          criado_em: string
          id: string
          ordem: number
          produto_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          criado_em?: string
          id?: string
          ordem?: number
          produto_id: string
          url: string
        }
        Update: {
          alt?: string | null
          criado_em?: string
          id?: string
          ordem?: number
          produto_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_fotos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          categoria_id: string | null
          como_e_feita: string | null
          criado_em: string
          descricao: string | null
          estoque: number
          excluido_em: string | null
          foto_url: string | null
          id: string
          nome: string
          ordem: number
          preco: number
          tempo_producao_dias: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          categoria_id?: string | null
          como_e_feita?: string | null
          criado_em?: string
          descricao?: string | null
          estoque?: number
          excluido_em?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number
          preco: number
          tempo_producao_dias?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          categoria_id?: string | null
          como_e_feita?: string | null
          criado_em?: string
          descricao?: string | null
          estoque?: number
          excluido_em?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number
          preco?: number
          tempo_producao_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_personalizado: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          nome: string
          ordem: number
          prazo_dias: number
          preco_base: number
          preco_max: number
          preco_min: number
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome: string
          ordem?: number
          prazo_dias?: number
          preco_base: number
          preco_max: number
          preco_min: number
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          nome?: string
          ordem?: number
          prazo_dias?: number
          preco_base?: number
          preco_max?: number
          preco_min?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          criado_em: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          criado_em?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_pedido: {
        Args: { _cliente: Json; _itens: Json }
        Returns: {
          codigo: string
          id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_admins: {
        Args: never
        Returns: {
          email: string
          is_admin: boolean
          user_id: string
        }[]
      }
      promote_admin_by_email: { Args: { _email: string }; Returns: undefined }
      revoke_admin: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "artesa"
      item_kind: "pronta" | "personalizado"
      pagamento_forma:
        | "pix"
        | "credito"
        | "debito"
        | "transferencia"
        | "dinheiro"
      pagamento_status: "pendente" | "parcial" | "pago"
      pedido_status:
        | "novos"
        | "producao"
        | "prontos"
        | "entregues"
        | "cancelado"
      pedido_tipo: "Pronta Entrega" | "Personalizado" | "Misto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "artesa"],
      item_kind: ["pronta", "personalizado"],
      pagamento_forma: [
        "pix",
        "credito",
        "debito",
        "transferencia",
        "dinheiro",
      ],
      pagamento_status: ["pendente", "parcial", "pago"],
      pedido_status: ["novos", "producao", "prontos", "entregues", "cancelado"],
      pedido_tipo: ["Pronta Entrega", "Personalizado", "Misto"],
    },
  },
} as const
