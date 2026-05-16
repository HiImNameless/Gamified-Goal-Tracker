export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          user_id: string;
          rank_tier: number;
          lp: number;
          total_xp: number;
          completed_quests: number;
          failed_quests: number;
          current_streak: number;
          longest_streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          rank_tier?: number;
          lp?: number;
          total_xp?: number;
          completed_quests?: number;
          failed_quests?: number;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          rank_tier?: number;
          lp?: number;
          total_xp?: number;
          completed_quests?: number;
          failed_quests?: number;
          current_streak?: number;
          longest_streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          receiver_id: string;
          status: "pending" | "accepted" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          receiver_id: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          receiver_id?: string;
          status?: "pending" | "accepted" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quests: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          type: "main" | "side" | "boss";
          difficulty: "easy" | "medium" | "hard" | "boss";
          status:
            | "draft"
            | "active"
            | "pending_verification"
            | "completed"
            | "failed"
            | "abandoned"
            | "expired";
          skill_category:
            | "health"
            | "fitness"
            | "programming"
            | "editing"
            | "study"
            | "money"
            | "creativity"
            | "discipline";
          deadline: string | null;
          failure_condition: string | null;
          reward_text: string | null;
          stake_text: string | null;
          proof_required: boolean;
          verifier_id: string | null;
          visibility: "private" | "friends";
          xp_reward: number;
          lp_reward: number;
          lp_penalty: number;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          failed_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string;
          type?: "main" | "side" | "boss";
          difficulty?: "easy" | "medium" | "hard" | "boss";
          status?:
            | "draft"
            | "active"
            | "pending_verification"
            | "completed"
            | "failed"
            | "abandoned"
            | "expired";
          skill_category?:
            | "health"
            | "fitness"
            | "programming"
            | "editing"
            | "study"
            | "money"
            | "creativity"
            | "discipline";
          deadline?: string | null;
          failure_condition?: string | null;
          reward_text?: string | null;
          stake_text?: string | null;
          proof_required?: boolean;
          verifier_id?: string | null;
          visibility?: "private" | "friends";
          xp_reward?: number;
          lp_reward?: number;
          lp_penalty?: number;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          failed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["quests"]["Insert"]>;
        Relationships: [];
      };
      quest_criteria: {
        Row: {
          id: string;
          quest_id: string;
          title: string;
          description: string | null;
          is_completed: boolean;
          deadline: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quest_id: string;
          title: string;
          description?: string | null;
          is_completed?: boolean;
          deadline?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quest_criteria"]["Insert"]>;
        Relationships: [];
      };
      proof_submissions: {
        Row: {
          id: string;
          quest_id: string;
          submitted_by: string;
          proof_text: string;
          file_url: string | null;
          status: "pending" | "approved" | "rejected";
          reviewer_id: string | null;
          reviewer_comment: string | null;
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          quest_id: string;
          submitted_by: string;
          proof_text?: string;
          file_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewer_id?: string | null;
          reviewer_comment?: string | null;
          created_at?: string;
          reviewed_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["proof_submissions"]["Insert"]>;
        Relationships: [];
      };
      quest_logs: {
        Row: {
          id: string;
          quest_id: string;
          user_id: string;
          action: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          quest_id: string;
          user_id: string;
          action: string;
          note?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quest_logs"]["Insert"]>;
        Relationships: [];
      };
      lp_events: {
        Row: {
          id: string;
          user_id: string;
          quest_id: string | null;
          amount: number;
          previous_rank_tier: number;
          previous_lp: number;
          new_rank_tier: number;
          new_lp: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quest_id?: string | null;
          amount: number;
          previous_rank_tier: number;
          previous_lp: number;
          new_rank_tier: number;
          new_lp: number;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lp_events"]["Insert"]>;
        Relationships: [];
      };
      skill_progress: {
        Row: {
          id: string;
          user_id: string;
          skill_category:
            | "health"
            | "fitness"
            | "programming"
            | "editing"
            | "study"
            | "money"
            | "creativity"
            | "discipline";
          xp: number;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_category:
            | "health"
            | "fitness"
            | "programming"
            | "editing"
            | "study"
            | "money"
            | "creativity"
            | "discipline";
          xp?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["skill_progress"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      friendship_status: "pending" | "accepted" | "rejected";
      proof_status: "pending" | "approved" | "rejected";
      quest_difficulty: "easy" | "medium" | "hard" | "boss";
      quest_status:
        | "draft"
        | "active"
        | "pending_verification"
        | "completed"
        | "failed"
        | "abandoned"
        | "expired";
      quest_type: "main" | "side" | "boss";
      skill_category:
        | "health"
        | "fitness"
        | "programming"
        | "editing"
        | "study"
        | "money"
        | "creativity"
        | "discipline";
      visibility: "private" | "friends";
    };
    CompositeTypes: Record<string, never>;
  };
};
