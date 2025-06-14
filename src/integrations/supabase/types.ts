export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          allow_registration: boolean | null
          auto_moderation: boolean | null
          auto_reply: Json | null
          catalog: Json | null
          created_at: string
          id: string
          notifications: Json | null
          operating_hours: Json | null
          updated_at: string
        }
        Insert: {
          allow_registration?: boolean | null
          auto_moderation?: boolean | null
          auto_reply?: Json | null
          catalog?: Json | null
          created_at?: string
          id?: string
          notifications?: Json | null
          operating_hours?: Json | null
          updated_at?: string
        }
        Update: {
          allow_registration?: boolean | null
          auto_moderation?: boolean | null
          auto_reply?: Json | null
          catalog?: Json | null
          created_at?: string
          id?: string
          notifications?: Json | null
          operating_hours?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      app_users: {
        Row: {
          auth_user_id: string | null
          branch_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          password_hash: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          username: string
        }
        Insert: {
          auth_user_id?: string | null
          branch_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          password_hash?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          username: string
        }
        Update: {
          auth_user_id?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          password_hash?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in_latitude: number | null
          check_in_longitude: number | null
          check_in_time: string | null
          check_out_latitude: number | null
          check_out_longitude: number | null
          check_out_time: string | null
          created_at: string
          date: string
          employee_id: string | null
          id: string
          location_id: string | null
          notes: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_in_time?: string | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          check_out_time?: string | null
          created_at?: string
          date: string
          employee_id?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          check_in_latitude?: number | null
          check_in_longitude?: number | null
          check_in_time?: string | null
          check_out_latitude?: number | null
          check_out_longitude?: number | null
          check_out_time?: string | null
          created_at?: string
          date?: string
          employee_id?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "employee_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          manager_name: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          manager_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          manager_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      broadcast_messages: {
        Row: {
          channels: string[]
          created_at: string
          created_by: string | null
          id: string
          message: string
          sent_at: string | null
          status: string
          target_audience: string[]
          title: string
          updated_at: string
        }
        Insert: {
          channels?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          message: string
          sent_at?: string | null
          status?: string
          target_audience?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          channels?: string[]
          created_at?: string
          created_by?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          status?: string
          target_audience?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_settings: {
        Row: {
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          site_description: string | null
          site_name: string | null
          updated_at: string | null
        }
        Insert: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          site_description?: string | null
          site_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          name: string
          reseller_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          reseller_id?: string | null
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reseller_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_tokens_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          claim_type: string
          created_at: string
          description: string
          employee_id: string | null
          id: string
          receipt_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          claim_type: string
          created_at?: string
          description: string
          employee_id?: string | null
          id?: string
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          claim_type?: string
          created_at?: string
          description?: string
          employee_id?: string | null
          id?: string
          receipt_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_settings: {
        Row: {
          created_at: string
          email: string | null
          id: string
          phone_number: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string
          assigned_employees: string | null
          birth_date: string | null
          branch_id: string | null
          company_name: string | null
          created_at: string
          credit_limit: number | null
          customer_type: string | null
          deal_date: string | null
          email: string | null
          estimated_days: number | null
          id: string
          id_number: string | null
          name: string
          needs: string | null
          notes: string | null
          payment_terms: number | null
          phone: string
          sales_id: string | null
          status: string
          survey_status: string | null
          updated_at: string
          work_completed_date: string | null
          work_notes: string | null
          work_start_date: string | null
          work_status: string | null
        }
        Insert: {
          address: string
          assigned_employees?: string | null
          birth_date?: string | null
          branch_id?: string | null
          company_name?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_type?: string | null
          deal_date?: string | null
          email?: string | null
          estimated_days?: number | null
          id?: string
          id_number?: string | null
          name: string
          needs?: string | null
          notes?: string | null
          payment_terms?: number | null
          phone: string
          sales_id?: string | null
          status: string
          survey_status?: string | null
          updated_at?: string
          work_completed_date?: string | null
          work_notes?: string | null
          work_start_date?: string | null
          work_status?: string | null
        }
        Update: {
          address?: string
          assigned_employees?: string | null
          birth_date?: string | null
          branch_id?: string | null
          company_name?: string | null
          created_at?: string
          credit_limit?: number | null
          customer_type?: string | null
          deal_date?: string | null
          email?: string | null
          estimated_days?: number | null
          id?: string
          id_number?: string | null
          name?: string
          needs?: string | null
          notes?: string | null
          payment_terms?: number | null
          phone?: string
          sales_id?: string | null
          status?: string
          survey_status?: string | null
          updated_at?: string
          work_completed_date?: string | null
          work_notes?: string | null
          work_start_date?: string | null
          work_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stats: {
        Row: {
          active_resellers: number | null
          created_at: string | null
          date: string
          id: string
          total_customers: number | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          active_resellers?: number | null
          created_at?: string | null
          date?: string
          id?: string
          total_customers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          active_resellers?: number | null
          created_at?: string | null
          date?: string
          id?: string
          total_customers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_locations: {
        Row: {
          address: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          radius: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          radius?: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          radius?: number
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department: string | null
          employee_code: string
          hire_date: string | null
          id: string
          position: string | null
          salary: number | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_code: string
          hire_date?: string | null
          id?: string
          position?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_code?: string
          hire_date?: string | null
          id?: string
          position?: string | null
          salary?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          created_at: string
          customer_id: string
          date: string
          follow_up_date: string | null
          id: string
          notes: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          date?: string
          follow_up_date?: string | null
          id?: string
          notes: string
          type: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          date?: string
          follow_up_date?: string | null
          id?: string
          notes?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          employee_id: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          employee_id?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          points_earned: number | null
          product_commission_snapshot: number | null
          product_id: string
          product_name: string
          product_points_snapshot: number | null
          product_price: number
          quantity: number
          subtotal: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          points_earned?: number | null
          product_commission_snapshot?: number | null
          product_id: string
          product_name: string
          product_points_snapshot?: number | null
          product_price: number
          quantity?: number
          subtotal: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          points_earned?: number | null
          product_commission_snapshot?: number | null
          product_id?: string
          product_name?: string
          product_points_snapshot?: number | null
          product_price?: number
          quantity?: number
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          catalog_token: string
          created_at: string
          customer_name: string
          customer_phone: string
          delivery_method: string | null
          discount_amount: number | null
          expedisi: string | null
          fulfillment_status: string | null
          id: string
          notes: string | null
          order_source: string | null
          payment_method: string | null
          payment_status: string | null
          priority: string | null
          shipping_address: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          catalog_token: string
          created_at?: string
          customer_name: string
          customer_phone: string
          delivery_method?: string | null
          discount_amount?: number | null
          expedisi?: string | null
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_source?: string | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          shipping_address?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          catalog_token?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          delivery_method?: string | null
          discount_amount?: number | null
          expedisi?: string | null
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_source?: string | null
          payment_method?: string | null
          payment_status?: string | null
          priority?: string | null
          shipping_address?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      overtime_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          date: string
          employee_id: string | null
          end_time: string
          id: string
          reason: string
          start_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date: string
          employee_id?: string | null
          end_time: string
          id?: string
          reason: string
          start_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          date?: string
          employee_id?: string | null
          end_time?: string
          id?: string
          reason?: string
          start_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          notes: string | null
          order_id: string | null
          payment_date: string
          payment_method: string
          payment_number: string
          reference_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string
          payment_method: string
          payment_number: string
          reference_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_date?: string
          payment_method?: string
          payment_number?: string
          reference_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          allowances: number | null
          basic_salary: number
          created_at: string
          deductions: number | null
          employee_id: string | null
          generated_by: string | null
          gross_salary: number
          id: string
          net_salary: number
          overtime_hours: number | null
          overtime_rate: number | null
          period_end: string
          period_start: string
          status: string | null
          tax: number | null
          updated_at: string
        }
        Insert: {
          allowances?: number | null
          basic_salary: number
          created_at?: string
          deductions?: number | null
          employee_id?: string | null
          generated_by?: string | null
          gross_salary: number
          id?: string
          net_salary: number
          overtime_hours?: number | null
          overtime_rate?: number | null
          period_end: string
          period_start: string
          status?: string | null
          tax?: number | null
          updated_at?: string
        }
        Update: {
          allowances?: number | null
          basic_salary?: number
          created_at?: string
          deductions?: number | null
          employee_id?: string | null
          generated_by?: string | null
          gross_salary?: number
          id?: string
          net_salary?: number
          overtime_hours?: number | null
          overtime_rate?: number | null
          period_end?: string
          period_start?: string
          status?: string | null
          tax?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          menu_path: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          menu_path: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          menu_path?: string
          name?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          commission_value: number | null
          cost_price: number | null
          created_at: string
          description: string | null
          dimensions: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_active: boolean
          min_stock_level: number | null
          name: string
          points_value: number | null
          price: number
          reseller_price: number | null
          sort_order: number | null
          stock_quantity: number | null
          supplier_id: string | null
          tags: string[] | null
          unit: string
          updated_at: string
          warranty_period: number | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          commission_value?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock_level?: number | null
          name: string
          points_value?: number | null
          price: number
          reseller_price?: number | null
          sort_order?: number | null
          stock_quantity?: number | null
          supplier_id?: string | null
          tags?: string[] | null
          unit?: string
          updated_at?: string
          warranty_period?: number | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          commission_value?: number | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_stock_level?: number | null
          name?: string
          points_value?: number | null
          price?: number
          reseller_price?: number | null
          sort_order?: number | null
          stock_quantity?: number | null
          supplier_id?: string | null
          tags?: string[] | null
          unit?: string
          updated_at?: string
          warranty_period?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_supplier"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: string
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_items: {
        Row: {
          created_at: string
          discount_percent: number | null
          id: string
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          product_id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          quote_date: string
          quote_number: string
          status: string
          tax_amount: number | null
          terms_conditions: string | null
          total_amount: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          quote_date?: string
          quote_number: string
          status?: string
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          quote_date?: string
          quote_number?: string
          status?: string
          tax_amount?: number | null
          terms_conditions?: string | null
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_order_history: {
        Row: {
          commission_earned: number
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          order_date: string
          order_id: string
          order_items: Json
          order_status: string
          points_earned: number
          reseller_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          commission_earned?: number
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          order_date: string
          order_id: string
          order_items?: Json
          order_status?: string
          points_earned?: number
          reseller_id: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          commission_earned?: number
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          order_date?: string
          order_id?: string
          order_items?: Json
          order_status?: string
          points_earned?: number
          reseller_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_order_history_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_orders: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          id: string
          order_id: string | null
          reseller_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          order_id?: string | null
          reseller_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          order_id?: string | null
          reseller_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_orders_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_sessions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reseller_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reseller_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reseller_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_sessions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_stats: {
        Row: {
          created_at: string
          id: string
          month_year: string
          reseller_id: string | null
          total_commission: number | null
          total_orders: number | null
          total_points: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          month_year: string
          reseller_id?: string | null
          total_commission?: number | null
          total_orders?: number | null
          total_points?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          month_year?: string
          reseller_id?: string | null
          total_commission?: number | null
          total_orders?: number | null
          total_points?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_stats_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      resellers: {
        Row: {
          address: string
          birth_date: string | null
          branch_id: string | null
          commission_rate: number | null
          created_at: string
          email: string | null
          id: string
          id_number: string | null
          is_active: boolean
          name: string
          notes: string | null
          password_hash: string | null
          phone: string
          pin_hash: string | null
          total_points: number | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          address: string
          birth_date?: string | null
          branch_id?: string | null
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean
          name: string
          notes?: string | null
          password_hash?: string | null
          phone: string
          pin_hash?: string | null
          total_points?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          address?: string
          birth_date?: string | null
          branch_id?: string | null
          commission_rate?: number | null
          created_at?: string
          email?: string | null
          id?: string
          id_number?: string | null
          is_active?: boolean
          name?: string
          notes?: string | null
          password_hash?: string | null
          phone?: string
          pin_hash?: string | null
          total_points?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resellers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_catalog: {
        Row: {
          cost: number
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          reward_type: string
          updated_at: string | null
        }
        Insert: {
          cost: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          reward_type: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          reward_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          amount_redeemed: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          reseller_id: string | null
          reward_description: string
          reward_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount_redeemed: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          reseller_id?: string | null
          reward_description: string
          reward_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_redeemed?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          reseller_id?: string | null
          reward_description?: string
          reward_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "resellers"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          id: string
          permission_id: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          permission_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          id?: string
          permission_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          branch_id: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          password_hash: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          payment_terms: number | null
          phone: string | null
          tax_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_id: string
          deal_date: string
          id: string
          is_completed: boolean
          price_approval: boolean
          product_quality: number
          service_sales: number
          service_technician: number
          suggestions: string | null
          survey_token: string
          testimonial: string | null
          usage_clarity: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_id: string
          deal_date: string
          id?: string
          is_completed?: boolean
          price_approval: boolean
          product_quality: number
          service_sales: number
          service_technician: number
          suggestions?: string | null
          survey_token?: string
          testimonial?: string | null
          usage_clarity: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          deal_date?: string
          id?: string
          is_completed?: boolean
          price_approval?: boolean
          product_quality?: number
          service_sales?: number
          service_technician?: number
          suggestions?: string | null
          survey_token?: string
          testimonial?: string | null
          usage_clarity?: number
        }
        Relationships: [
          {
            foreignKeyName: "surveys_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tips: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          employee_id: string | null
          end_time: string
          id: string
          is_active: boolean
          location_id: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          employee_id?: string | null
          end_time: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          employee_id?: string | null
          end_time?: string
          id?: string
          is_active?: boolean
          location_id?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_schedules_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "employee_locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_app_user: {
        Args: { email_input: string; password_input: string }
        Returns: Json
      }
      authenticate_reseller_app: {
        Args: { phone_input: string; password_input: string }
        Returns: Json
      }
      authenticate_sales_user: {
        Args: { email_input: string; password_input: string }
        Returns: Json
      }
      generate_payment_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_po_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_short_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_reseller_stats: {
        Args: { reseller_id_input: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "manager", "staff"],
    },
  },
} as const
