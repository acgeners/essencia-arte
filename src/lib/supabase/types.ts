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
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          option_id: string | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          option_id?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          option_id?: string | null
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: true
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_tangible: boolean | null
          name: string
          price: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_tangible?: boolean | null
          name: string
          price?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_tangible?: boolean | null
          name?: string
          price?: number | null
          type?: string
        }
        Relationships: []
      }
      order_item_extras: {
        Row: {
          extra_option_id: string
          order_item_id: string
          price: number
        }
        Insert: {
          extra_option_id: string
          order_item_id: string
          price: number
        }
        Update: {
          extra_option_id?: string
          order_item_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_item_extras_extra_option_id_fkey"
            columns: ["extra_option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_item_extras_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          glitter_id: string | null
          id: string
          order_id: string | null
          packaging_id: string | null
          personalization_name: string | null
          price: number
          primary_color_id: string | null
          product_id: string | null
          secondary_color_id: string | null
          shipping_id: string | null
          tassel_color_id: string | null
        }
        Insert: {
          created_at?: string | null
          glitter_id?: string | null
          id?: string
          order_id?: string | null
          packaging_id?: string | null
          personalization_name?: string | null
          price: number
          primary_color_id?: string | null
          product_id?: string | null
          secondary_color_id?: string | null
          shipping_id?: string | null
          tassel_color_id?: string | null
        }
        Update: {
          created_at?: string | null
          glitter_id?: string | null
          id?: string
          order_id?: string | null
          packaging_id?: string | null
          personalization_name?: string | null
          price?: number
          primary_color_id?: string | null
          product_id?: string | null
          secondary_color_id?: string | null
          shipping_id?: string | null
          tassel_color_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_glitter_id_fkey"
            columns: ["glitter_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_packaging_id_fkey"
            columns: ["packaging_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_primary_color_id_fkey"
            columns: ["primary_color_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_secondary_color_id_fkey"
            columns: ["secondary_color_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_shipping_id_fkey"
            columns: ["shipping_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_tassel_color_id_fkey"
            columns: ["tassel_color_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          balance: number
          code: string
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          deposit: number
          id: string
          shipping_cost: number
          status: string
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          balance: number
          code: string
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          deposit: number
          id?: string
          shipping_cost?: number
          status?: string
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          deposit?: number
          id?: string
          shipping_cost?: number
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category_links: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_category_links_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          option_id: string
          product_id: string
        }
        Insert: {
          option_id: string
          product_id: string
        }
        Update: {
          option_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string | null
          id: string
          images: string[] | null
          name: string
          option_ids: string[] | null
          production_days_max: number
          production_days_min: number
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          name: string
          option_ids?: string[] | null
          production_days_max?: number
          production_days_min?: number
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          name?: string
          option_ids?: string[] | null
          production_days_max?: number
          production_days_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order_with_stock_check:
        | {
            Args: {
              p_balance: number
              p_customer_email: string
              p_customer_name: string
              p_customer_notes: string
              p_customer_phone: string
              p_deposit: number
              p_extras: Json
              p_glitter_id: string
              p_item_price: number
              p_packaging_id: string
              p_personalization_name: string
              p_primary_color_id: string
              p_product_id: string
              p_secondary_color_id: string
              p_shipping_cost: number
              p_shipping_id: string
              p_subtotal: number
              p_tassel_color_id: string
              p_total: number
            }
            Returns: string
          }
        | {
            Args: {
              p_balance: number
              p_customer_email: string
              p_customer_id?: string
              p_customer_name: string
              p_customer_notes: string
              p_customer_phone: string
              p_deposit: number
              p_extras: Json
              p_glitter_id: string
              p_item_price: number
              p_packaging_id: string
              p_personalization_name: string
              p_primary_color_id: string
              p_product_id: string
              p_secondary_color_id: string
              p_shipping_cost: number
              p_shipping_id: string
              p_subtotal: number
              p_tassel_color_id: string
              p_total: number
            }
            Returns: string
          }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
