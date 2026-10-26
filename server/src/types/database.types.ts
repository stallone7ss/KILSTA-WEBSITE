/**
 * Typed interface for the KILSTA Supabase schema.
 * Keep in sync with supabase/migrations/*.sql. In a linked project this can be
 * regenerated with:
 *   supabase gen types typescript --project-id <id> > server/src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: 'admin' | 'staff';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'admin' | 'staff';
          created_at?: string;
        };
        Update: {
          role?: 'admin' | 'staff';
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: 'business' | 'ict' | 'training';
          summary: string;
          description: string;
          features: string[];
          icon: string | null;
          image_url: string | null;
          featured: boolean;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category: 'business' | 'ict' | 'training';
          summary: string;
          description?: string;
          features?: string[];
          icon?: string | null;
          image_url?: string | null;
          featured?: boolean;
          published?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: [];
      };
      quote_requests: {
        Row: {
          id: string;
          reference: string;
          full_name: string;
          organization: string | null;
          email: string;
          phone: string;
          service_category: 'business' | 'ict' | 'training';
          requested_service: string;
          project_description: string;
          preferred_contact_method: 'email' | 'phone';
          budget_range: string | null;
          preferred_completion_date: string | null;
          contact_consent: boolean;
          status:
            | 'New'
            | 'Under Review'
            | 'Quoted'
            | 'Accepted'
            | 'In Progress'
            | 'Completed'
            | 'Rejected';
          assigned_to: string | null;
          internal_notes: string | null;
          customer_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
          business_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
          notification_attempted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          full_name: string;
          organization?: string | null;
          email: string;
          phone: string;
          service_category: 'business' | 'ict' | 'training';
          requested_service: string;
          project_description: string;
          preferred_contact_method: 'email' | 'phone';
          budget_range?: string | null;
          preferred_completion_date?: string | null;
          contact_consent: boolean;
          status?: Database['public']['Tables']['quote_requests']['Row']['status'];
          assigned_to?: string | null;
          internal_notes?: string | null;
          customer_notification_status?: 'pending' | 'sent' | 'failed' | 'skipped';
          business_notification_status?: 'pending' | 'sent' | 'failed' | 'skipped';
          notification_attempted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['quote_requests']['Insert']>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          organization: string | null;
          subject: string;
          message: string;
          contact_consent: boolean;
          status: 'New' | 'In Progress' | 'Resolved';
          internal_notes: string | null;
          customer_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
          business_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
          notification_attempted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          organization?: string | null;
          subject: string;
          message: string;
          contact_consent: boolean;
          status?: 'New' | 'In Progress' | 'Resolved';
          internal_notes?: string | null;
          customer_notification_status?: 'pending' | 'sent' | 'failed' | 'skipped';
          business_notification_status?: 'pending' | 'sent' | 'failed' | 'skipped';
          notification_attempted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>;
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category:
            | 'basic-computing'
            | 'microsoft-office'
            | 'software-training'
            | 'internet-services'
            | 'other';
          summary: string;
          description: string;
          level: string | null;
          duration: string | null;
          price: number | null;
          currency: string;
          schedule: string | null;
          delivery_mode: string | null;
          published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category?: Database['public']['Tables']['courses']['Row']['category'];
          summary: string;
          description?: string;
          level?: string | null;
          duration?: string | null;
          price?: number | null;
          currency?: string;
          schedule?: string | null;
          delivery_mode?: string | null;
          published?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
        Relationships: [];
      };
      course_registrations: {
        Row: {
          id: string;
          reference: string;
          course_id: string;
          full_name: string;
          email: string;
          phone: string;
          organization: string | null;
          preferred_start_date: string | null;
          message: string | null;
          contact_consent: boolean;
          status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
          internal_notes: string | null;
          customer_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
          business_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
          notification_attempted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference: string;
          course_id: string;
          full_name: string;
          email: string;
          phone: string;
          organization?: string | null;
          preferred_start_date?: string | null;
          message?: string | null;
          contact_consent: boolean;
          status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
          internal_notes?: string | null;
          customer_notification_status?: 'pending' | 'sent' | 'failed' | 'skipped';
          business_notification_status?: 'pending' | 'sent' | 'failed' | 'skipped';
          notification_attempted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['course_registrations']['Insert']>;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          category: 'business' | 'ict' | 'training';
          client_name: string | null;
          summary: string;
          description: string;
          completed_at: string | null;
          featured: boolean;
          published: boolean;
          is_sample: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          category: 'business' | 'ict' | 'training';
          client_name?: string | null;
          summary: string;
          description?: string;
          completed_at?: string | null;
          featured?: boolean;
          published?: boolean;
          is_sample?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          alt_text: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          alt_text?: string;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['project_images']['Insert']>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          name: string;
          category: string;
          description: string;
          price: number | null;
          currency: string;
          stock_quantity: number;
          low_stock_threshold: number;
          track_stock: boolean;
          image_url: string | null;
          published: boolean;
          is_sample: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          slug: string;
          name: string;
          category?: string;
          description?: string;
          price?: number | null;
          currency?: string;
          stock_quantity?: number;
          low_stock_threshold?: number;
          track_stock?: boolean;
          image_url?: string | null;
          published?: boolean;
          is_sample?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
        Relationships: [];
      };
      staff_profiles: {
        Row: {
          id: string;
          full_name: string;
          title: string;
          bio: string;
          photo_url: string | null;
          email: string | null;
          phone: string | null;
          is_public: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          title: string;
          bio?: string;
          photo_url?: string | null;
          email?: string | null;
          phone?: string | null;
          is_public?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['staff_profiles']['Insert']>;
        Relationships: [];
      };
      activity_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['activity_logs']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_has_role: {
        Args: { required_role: string };
        Returns: boolean;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
