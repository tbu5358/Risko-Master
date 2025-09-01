export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      match_participants: {
        Row: {
          eliminated_at: string | null
          final_position: number | null
          match_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          eliminated_at?: string | null
          final_position?: number | null
          match_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          eliminated_at?: string | null
          final_position?: number | null
          match_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          ended_at: string | null
          fee_percent: number
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          metadata: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["match_status"]
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          fee_percent?: number
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          fee_percent?: number
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
        }
        Relationships: []
      }
      royale_state: {
        Row: {
          active_players: number | null
          map_seed: string | null
          match_id: string
          raw_state: Json | null
          top_scores: Json | null
        }
        Insert: {
          active_players?: number | null
          map_seed?: string | null
          match_id: string
          raw_state?: Json | null
          top_scores?: Json | null
        }
        Update: {
          active_players?: number | null
          map_seed?: string | null
          match_id?: string
          raw_state?: Json | null
          top_scores?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "royale_state_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      speedchess_games: {
        Row: {
          increment: number
          match_id: string
          moves_log: string | null
          result: string | null
          time_control: number
          winner_user_id: string | null
        }
        Insert: {
          increment: number
          match_id: string
          moves_log?: string | null
          result?: string | null
          time_control: number
          winner_user_id?: string | null
        }
        Update: {
          increment?: number
          match_id?: string
          moves_log?: string | null
          result?: string | null
          time_control?: number
          winner_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speedchess_games_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          id: string
          idempotency_key: string | null
          match_id: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          tx_ref: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          idempotency_key?: string | null
          match_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tx_ref?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          id?: string
          idempotency_key?: string | null
          match_id?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          tx_ref?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          roles: string[] | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          roles?: string[] | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          roles?: string[] | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string | null
          currency: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          currency?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          currency?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      game_mode_totals: {
        Row: {
          game_type: Database["public"]["Enums"]["game_type"] | null
          total_fee_cents: number | null
          total_matches: number | null
          total_won_cents: number | null
        }
        Relationships: []
      }
      leaderboard_view: {
        Row: {
          username: string
          total_pnl: number
          wins: number
          losses: number
          win_rate: number
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: Array<{
          username: string
          total_pnl: number
          wins: number
          losses: number
          win_rate: number
        }>
      }
    }
    Enums: {
      game_type: "speedchess" | "lastman" | "snakeroyale"
      match_status: "pending" | "active" | "finished" | "cancelled"
      transaction_status: "pending" | "complete" | "failed"
      transaction_type:
        | "deposit"
        | "withdraw"
        | "internal_credit"
        | "internal_debit"
        | "house_fee"
        | "game_win"
        | "game_loss"
        | "fee"
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
    : never,
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
      game_type: ["speedchess", "lastman", "snakeroyale"],
      match_status: ["pending", "active", "finished", "cancelled"],
      transaction_status: ["pending", "complete", "failed"],
      transaction_type: [
        "deposit",
        "withdraw",
        "internal_credit",
        "internal_debit",
        "house_fee",
        "game_win",
        "game_loss",
        "fee",
      ],
    },
  },
} as const
