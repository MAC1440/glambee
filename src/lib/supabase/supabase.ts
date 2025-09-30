export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          receiver_type: Database["public"]["Enums"]["admin_notification_receiver_type"]
          title: string
          type: Database["public"]["Enums"]["admin_notification_type"]
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          receiver_type?: Database["public"]["Enums"]["admin_notification_receiver_type"]
          title: string
          type?: Database["public"]["Enums"]["admin_notification_type"]
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          receiver_type?: Database["public"]["Enums"]["admin_notification_receiver_type"]
          title?: string
          type?: Database["public"]["Enums"]["admin_notification_type"]
        }
        Relationships: []
      }
      app_configuration: {
        Row: {
          id: string
          is_coming_soon: boolean | null
          is_guest_mode: boolean | null
          is_test_mode: boolean | null
        }
        Insert: {
          id?: string
          is_coming_soon?: boolean | null
          is_guest_mode?: boolean | null
          is_test_mode?: boolean | null
        }
        Update: {
          id?: string
          is_coming_soon?: boolean | null
          is_guest_mode?: boolean | null
          is_test_mode?: boolean | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          bill: number | null
          booking_approach: string | null
          booking_type: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          date: string
          end_time: string | null
          id: string
          is_accepted: boolean | null
          is_rejected: boolean | null
          is_set_reminder: boolean | null
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status_enum"]
          phone_number: string | null
          salon_id: string
          staff_id: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          bill?: number | null
          booking_approach?: string | null
          booking_type?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          date: string
          end_time?: string | null
          id?: string
          is_accepted?: boolean | null
          is_rejected?: boolean | null
          is_set_reminder?: boolean | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          phone_number?: string | null
          salon_id: string
          staff_id?: string | null
          start_time?: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          bill?: number | null
          booking_approach?: string | null
          booking_type?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          date?: string
          end_time?: string | null
          id?: string
          is_accepted?: boolean | null
          is_rejected?: boolean | null
          is_set_reminder?: boolean | null
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status_enum"]
          phone_number?: string | null
          salon_id?: string
          staff_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fk"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_staff_id"
            columns: ["staff_id"]
            referencedRelation: "salons_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_deals: {
        Row: {
          appointment_id: string
          created_at: string
          customer_own_deal_id: string | null
          deal_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          customer_own_deal_id?: string | null
          deal_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          customer_own_deal_id?: string | null
          deal_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_deals_appointment_id_fk"
            columns: ["appointment_id"]
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_deals_customer_own_deal_id_fkey"
            columns: ["customer_own_deal_id"]
            referencedRelation: "customer_own_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_deal_id"
            columns: ["deal_id"]
            referencedRelation: "salons_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_packages: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          package_id: string
          price: number
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          package_id: string
          price: number
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          package_id?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_packages_appointment_id_fk"
            columns: ["appointment_id"]
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_packages_package_id_fk"
            columns: ["package_id"]
            referencedRelation: "salons_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_services: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          price: number
          service_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          price: number
          service_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          price?: number
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_services_appointment_id_fk"
            columns: ["appointment_id"]
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_services_service_id_fk"
            columns: ["service_id"]
            referencedRelation: "salons_services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      Categories: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_read: boolean | null
          message: string
          receiver_id: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          message: string
          receiver_id?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_read?: boolean | null
          message?: string
          receiver_id?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          is_deleted: boolean | null
          salon_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_deleted?: boolean | null
          salon_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_deleted?: boolean | null
          salon_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_own_deals: {
        Row: {
          created_at: string | null
          customer_id: string | null
          discount_percentage: number | null
          discounted_price: number | null
          id: string
          price: number | null
          salon_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          id?: string
          price?: number | null
          salon_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          id?: string
          price?: number | null
          salon_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_own_deals_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_own_deals_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          activity_status: string
          auth_id: string
          avatar: string | null
          created_at: string
          fcm_token: string | null
          gender: string | null
          has_spinned: boolean | null
          id: string
          is_test_user: boolean | null
          name: string | null
          updated_at: string
        }
        Insert: {
          activity_status?: string
          auth_id: string
          avatar?: string | null
          created_at?: string
          fcm_token?: string | null
          gender?: string | null
          has_spinned?: boolean | null
          id?: string
          is_test_user?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          activity_status?: string
          auth_id?: string
          avatar?: string | null
          created_at?: string
          fcm_token?: string | null
          gender?: string | null
          has_spinned?: boolean | null
          id?: string
          is_test_user?: boolean | null
          name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_auth_id_fk"
            columns: ["auth_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_favourites: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: number
          type: string | null
          type_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: number
          type?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: number
          type?: string | null
          type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_favourites_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_code_usages: {
        Row: {
          appointment_id: string
          created_at: string
          customer_id: string
          discount_code_id: string
          id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          customer_id: string
          discount_code_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          customer_id?: string
          discount_code_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usages_appointment_id_fkey"
            columns: ["appointment_id"]
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usages_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usages_discount_code_id_fkey"
            columns: ["discount_code_id"]
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          id: string
          max_uses: number
          sponsor_name: string
          sponsor_type: Database["public"]["Enums"]["sponsor_type"]
          status: Database["public"]["Enums"]["coupon_status"]
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value: number
          id?: string
          max_uses?: number
          sponsor_name?: string
          sponsor_type?: Database["public"]["Enums"]["sponsor_type"]
          status?: Database["public"]["Enums"]["coupon_status"]
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["coupon_discount_type"]
          discount_value?: number
          id?: string
          max_uses?: number
          sponsor_name?: string
          sponsor_type?: Database["public"]["Enums"]["sponsor_type"]
          status?: Database["public"]["Enums"]["coupon_status"]
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      discounts: {
        Row: {
          created_at: string
          duration: Database["public"]["Enums"]["duration_type"] | null
          id: string
          off_percentage: number | null
          original_price: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          duration?: Database["public"]["Enums"]["duration_type"] | null
          id?: string
          off_percentage?: number | null
          original_price?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          duration?: Database["public"]["Enums"]["duration_type"] | null
          id?: string
          off_percentage?: number | null
          original_price?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          device_brand: string | null
          device_id: string | null
          device_manufacturer: string | null
          device_model: string | null
          id: string
          token: string
          user_id: string
          user_type: Database["public"]["Enums"]["fcm_token_user_type"]
        }
        Insert: {
          created_at?: string | null
          device_brand?: string | null
          device_id?: string | null
          device_manufacturer?: string | null
          device_model?: string | null
          id?: string
          token: string
          user_id: string
          user_type: Database["public"]["Enums"]["fcm_token_user_type"]
        }
        Update: {
          created_at?: string | null
          device_brand?: string | null
          device_id?: string | null
          device_manufacturer?: string | null
          device_model?: string | null
          id?: string
          token?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["fcm_token_user_type"]
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          id: string
          salon_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          salon_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          salon_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_followers_salon"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_user_id_fk"
            columns: ["user_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      help_center: {
        Row: {
          created_at: string
          customer_id: string | null
          description: string | null
          id: string
          problem: string
          salon_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          problem: string
          salon_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          problem?: string
          salon_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_salon"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_center_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_salon: {
        Row: {
          certificate_url: string | null
          cnic_back_pic_url: string
          cnic_front_pic_url: string
          cnic_number: string
          created_at: string
          id: string
          name: string | null
          salon_id: string
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          cnic_back_pic_url: string
          cnic_front_pic_url: string
          cnic_number: string
          created_at?: string
          id?: string
          name?: string | null
          salon_id: string
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          cnic_back_pic_url?: string
          cnic_front_pic_url?: string
          cnic_number?: string
          created_at?: string
          id?: string
          name?: string | null
          salon_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_kyc_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          is_scheduled: boolean | null
          message: string
          metadata: Json | null
          receiver_id: string
          receiver_type: Database["public"]["Enums"]["receiver_type"] | null
          scheduled_at: string | null
          sender_id: string
          title: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_scheduled?: boolean | null
          message: string
          metadata?: Json | null
          receiver_id: string
          receiver_type?: Database["public"]["Enums"]["receiver_type"] | null
          scheduled_at?: string | null
          sender_id: string
          title?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_scheduled?: boolean | null
          message?: string
          metadata?: Json | null
          receiver_id?: string
          receiver_type?: Database["public"]["Enums"]["receiver_type"] | null
          scheduled_at?: string | null
          sender_id?: string
          title?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          area: string | null
          boost_for_days: number | null
          boost_started_at: string | null
          city: string | null
          content: string | null
          created_at: string
          id: string
          is_sponsored: boolean | null
          media: Json[] | null
          media_url: string | null
          portfolio: boolean
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          boost_for_days?: number | null
          boost_started_at?: string | null
          city?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_sponsored?: boolean | null
          media?: Json[] | null
          media_url?: string | null
          portfolio?: boolean
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          boost_for_days?: number | null
          boost_started_at?: string | null
          city?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_sponsored?: boolean | null
          media?: Json[] | null
          media_url?: string | null
          portfolio?: boolean
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_comments_post_id_fk"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_comments_user_id_fk"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_likes_post_id_fk"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_likes_user_id_fk"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts_share: {
        Row: {
          created_at: string
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_share_post_id_fk"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_share_user_id_fk"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prizes: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          wining_prize: string
          winner_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          wining_prize: string
          winner_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          wining_prize?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prizes_winner_id_fkey"
            columns: ["winner_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          aisleLocations: string | null
          brand: string | null
          categories: string | null
          countryOrigin: string | null
          description: string | null
          id: number
          images: Json | null
          itemInformation: string | null
          items: Json | null
          productId: string | null
          productPageURI: string | null
          temperature: Json | null
          upc: string | null
        }
        Insert: {
          aisleLocations?: string | null
          brand?: string | null
          categories?: string | null
          countryOrigin?: string | null
          description?: string | null
          id?: number
          images?: Json | null
          itemInformation?: string | null
          items?: Json | null
          productId?: string | null
          productPageURI?: string | null
          temperature?: Json | null
          upc?: string | null
        }
        Update: {
          aisleLocations?: string | null
          brand?: string | null
          categories?: string | null
          countryOrigin?: string | null
          description?: string | null
          id?: number
          images?: Json | null
          itemInformation?: string | null
          items?: Json | null
          productId?: string | null
          productPageURI?: string | null
          temperature?: Json | null
          upc?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_reported: boolean
          rating: number
          report_reason: string | null
          salon_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_reported?: boolean
          rating: number
          report_reason?: string | null
          salon_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_reported?: boolean
          rating?: number
          report_reason?: string | null
          salon_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fk"
            columns: ["user_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_salon"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_discounts: {
        Row: {
          created_at: string
          deal_discount: number
          id: string
          package_discount: number
          salon_id: string
          service_discount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deal_discount: number
          id?: string
          package_discount: number
          salon_id: string
          service_discount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deal_discount?: number
          id?: string
          package_discount?: number
          salon_id?: string
          service_discount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salon_discounts_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons: {
        Row: {
          activity_status: string
          address: string | null
          admin_status: Database["public"]["Enums"]["admin_status"] | null
          allow_create_custom_deals: boolean | null
          auth_id: string | null
          avatar: string | null
          close_time: string | null
          coverpicture: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          fcm_token: string | null
          id: string
          instagram_access_token: string | null
          instagram_connected_at: string | null
          instagram_url: string | null
          instagram_username: string | null
          is_premium: boolean
          is_test_user: boolean | null
          lat: number | null
          lng: number | null
          name: string | null
          open_time: string | null
          owner_name: string | null
          phone_number: string | null
          rating: number | null
          rejected_reason: string | null
          updated_at: string
          visits: number | null
        }
        Insert: {
          activity_status?: string
          address?: string | null
          admin_status?: Database["public"]["Enums"]["admin_status"] | null
          allow_create_custom_deals?: boolean | null
          auth_id?: string | null
          avatar?: string | null
          close_time?: string | null
          coverpicture?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          fcm_token?: string | null
          id?: string
          instagram_access_token?: string | null
          instagram_connected_at?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          is_premium?: boolean
          is_test_user?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          open_time?: string | null
          owner_name?: string | null
          phone_number?: string | null
          rating?: number | null
          rejected_reason?: string | null
          updated_at?: string
          visits?: number | null
        }
        Update: {
          activity_status?: string
          address?: string | null
          admin_status?: Database["public"]["Enums"]["admin_status"] | null
          allow_create_custom_deals?: boolean | null
          auth_id?: string | null
          avatar?: string | null
          close_time?: string | null
          coverpicture?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          fcm_token?: string | null
          id?: string
          instagram_access_token?: string | null
          instagram_connected_at?: string | null
          instagram_url?: string | null
          instagram_username?: string | null
          is_premium?: boolean
          is_test_user?: boolean | null
          lat?: number | null
          lng?: number | null
          name?: string | null
          open_time?: string | null
          owner_name?: string | null
          phone_number?: string | null
          rating?: number | null
          rejected_reason?: string | null
          updated_at?: string
          visits?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_auth_id_fk"
            columns: ["auth_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_availability: {
        Row: {
          close_time: string | null
          created_at: string
          date: string | null
          day_of_week: string | null
          id: string
          is_closed: boolean | null
          salon_id: string
          start_time: string | null
          time: string | null
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          created_at?: string
          date?: string | null
          day_of_week?: string | null
          id?: string
          is_closed?: boolean | null
          salon_id: string
          start_time?: string | null
          time?: string | null
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          created_at?: string
          date?: string | null
          day_of_week?: string | null
          id?: string
          is_closed?: boolean | null
          salon_id?: string
          start_time?: string | null
          time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_availability_salonid_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_deals: {
        Row: {
          created_at: string
          dealpopup: boolean | null
          discounted_price: number | null
          id: string
          media_url: string | null
          popup_color: string | null
          popup_template: string | null
          popup_timestamp: string | null
          popup_title: string | null
          price: number | null
          prices_may_vary: boolean | null
          salon_id: string
          title: string
          updated_at: string
          valid_from: string | null
          valid_till: string | null
        }
        Insert: {
          created_at?: string
          dealpopup?: boolean | null
          discounted_price?: number | null
          id?: string
          media_url?: string | null
          popup_color?: string | null
          popup_template?: string | null
          popup_timestamp?: string | null
          popup_title?: string | null
          price?: number | null
          prices_may_vary?: boolean | null
          salon_id: string
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_till?: string | null
        }
        Update: {
          created_at?: string
          dealpopup?: boolean | null
          discounted_price?: number | null
          id?: string
          media_url?: string | null
          popup_color?: string | null
          popup_template?: string | null
          popup_timestamp?: string | null
          popup_title?: string | null
          price?: number | null
          prices_may_vary?: boolean | null
          salon_id?: string
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_till?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_deals_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_deals_services: {
        Row: {
          created_at: string
          customer_own_deal_id: string | null
          deal_id: string | null
          id: string
          salon_id: string
          salon_service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_own_deal_id?: string | null
          deal_id?: string | null
          id?: string
          salon_id: string
          salon_service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_own_deal_id?: string | null
          deal_id?: string | null
          id?: string
          salon_id?: string
          salon_service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_deals_services_customer_own_deal_id_fkey"
            columns: ["customer_own_deal_id"]
            referencedRelation: "customer_own_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_deals_services_deal_id_fk"
            columns: ["deal_id"]
            referencedRelation: "salons_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_deals_services_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_deals_services_salon_service_id_fk"
            columns: ["salon_service_id"]
            referencedRelation: "salons_services"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_follower: {
        Row: {
          created_at: string | null
          id: string
          salon_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          salon_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          salon_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      salons_media: {
        Row: {
          created_at: string | null
          id: string
          insta_media_id: string | null
          is_converted_to_post: boolean
          is_deleted: boolean
          media_type: string | null
          media_url: string | null
          salon_id: string
          share_count: number | null
          source: Database["public"]["Enums"]["source_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          insta_media_id?: string | null
          is_converted_to_post?: boolean
          is_deleted?: boolean
          media_type?: string | null
          media_url?: string | null
          salon_id: string
          share_count?: number | null
          source?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          insta_media_id?: string | null
          is_converted_to_post?: boolean
          is_deleted?: boolean
          media_type?: string | null
          media_url?: string | null
          salon_id?: string
          share_count?: number | null
          source?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_media_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_media_likes: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          media_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          media_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          media_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_media_likes_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_media_likes_media_id_fkey"
            columns: ["media_id"]
            referencedRelation: "salons_media"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_packages: {
        Row: {
          advancepayment: boolean
          advancepayment_percent: number | null
          description: string | null
          duration: string
          id: string
          price: number
          salon_id: string
          title: string
        }
        Insert: {
          advancepayment?: boolean
          advancepayment_percent?: number | null
          description?: string | null
          duration: string
          id?: string
          price: number
          salon_id: string
          title: string
        }
        Update: {
          advancepayment?: boolean
          advancepayment_percent?: number | null
          description?: string | null
          duration?: string
          id?: string
          price?: number
          salon_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_packages_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_products: {
        Row: {
          actual_price: number
          created_at: string
          description: string | null
          discounted_price: number | null
          id: string
          images: Json | null
          out_of_stock: boolean
          product_category: string | null
          salon_id: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_price: number
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          images?: Json | null
          out_of_stock?: boolean
          product_category?: string | null
          salon_id: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_price?: number
          created_at?: string
          description?: string | null
          discounted_price?: number | null
          id?: string
          images?: Json | null
          out_of_stock?: boolean
          product_category?: string | null
          salon_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_products_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_products_photos: {
        Row: {
          avatar: string
          created_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          avatar: string
          created_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          avatar?: string
          created_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salons_products_photos_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "salons_products"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_services: {
        Row: {
          category_id: string | null
          created_at: string
          gender: string | null
          has_range: boolean | null
          id: string
          name: string
          price: number
          salon_id: string
          starting_from: number | null
          time: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          gender?: string | null
          has_range?: boolean | null
          id?: string
          name: string
          price: number
          salon_id: string
          starting_from?: number | null
          time: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          gender?: string | null
          has_range?: boolean | null
          id?: string
          name?: string
          price?: number
          salon_id?: string
          starting_from?: number | null
          time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_salon_services_category"
            columns: ["category_id"]
            referencedRelation: "staff_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_services_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_special_offers: {
        Row: {
          area: string | null
          audience: string | null
          auto_renewal: boolean | null
          boost_duration:
            | Database["public"]["Enums"]["boost_duration_enum"]
            | null
          city: string | null
          created_at: string | null
          discount_id: string | null
          discounted_price: number | null
          goal: string | null
          id: string
          image: string | null
          off_percentage: number | null
          original_price: number | null
          salon_id: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          audience?: string | null
          auto_renewal?: boolean | null
          boost_duration?:
            | Database["public"]["Enums"]["boost_duration_enum"]
            | null
          city?: string | null
          created_at?: string | null
          discount_id?: string | null
          discounted_price?: number | null
          goal?: string | null
          id?: string
          image?: string | null
          off_percentage?: number | null
          original_price?: number | null
          salon_id: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          audience?: string | null
          auto_renewal?: boolean | null
          boost_duration?:
            | Database["public"]["Enums"]["boost_duration_enum"]
            | null
          city?: string | null
          created_at?: string | null
          discount_id?: string | null
          discounted_price?: number | null
          goal?: string | null
          id?: string
          image?: string | null
          off_percentage?: number | null
          original_price?: number | null
          salon_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salons_special_offers_discount_id_fkey"
            columns: ["discount_id"]
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salons_special_offers_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      salons_staff: {
        Row: {
          avatar: string | null
          created_at: string | null
          id: string
          name: string | null
          phone_number: string | null
          role: string | null
          salon_id: string | null
          shift_close_time: string | null
          shift_open_time: string | null
          staff_address: string | null
          staff_department: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: string | null
          salon_id?: string | null
          shift_close_time?: string | null
          shift_open_time?: string | null
          staff_address?: string | null
          staff_department?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          phone_number?: string | null
          role?: string | null
          salon_id?: string | null
          shift_close_time?: string | null
          shift_open_time?: string | null
          staff_address?: string | null
          staff_department?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          createdAt: string
          data: string | null
          expires: string | null
          sid: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          data?: string | null
          expires?: string | null
          sid: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          data?: string | null
          expires?: string | null
          sid?: string
          updatedAt?: string
        }
        Relationships: []
      }
      staff_categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string | null
          tag_line: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          tag_line?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string | null
          tag_line?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_category_assignments: {
        Row: {
          category_id: string
          salon_id: string | null
          staff_id: string
        }
        Insert: {
          category_id: string
          salon_id?: string | null
          staff_id: string
        }
        Update: {
          category_id?: string
          salon_id?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_category_assignments_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "staff_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_category_assignments_salon_id_fkey"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_category_assignments_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "salons_staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_role_assignments: {
        Row: {
          role_id: string
          staff_id: string
        }
        Insert: {
          role_id: string
          staff_id: string
        }
        Update: {
          role_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_role_assignments_role_id_fkey"
            columns: ["role_id"]
            referencedRelation: "staff_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          id: string
          insta_story_id: string | null
          is_deleted: boolean
          media_type: string | null
          media_url: string | null
          salon_id: string
          source: Database["public"]["Enums"]["source_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          insta_story_id?: string | null
          is_deleted?: boolean
          media_type?: string | null
          media_url?: string | null
          salon_id: string
          source?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          insta_story_id?: string | null
          is_deleted?: boolean
          media_type?: string | null
          media_url?: string | null
          salon_id?: string
          source?: Database["public"]["Enums"]["source_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
        ]
      }
      sub_categories: {
        Row: {
          category_id: number | null
          created_at: string
          id: number
          title: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string
          id?: number
          title?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string
          id?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_categories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "Categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          salon_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          subscription_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          salon_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          salon_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          subscription_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_salon_id_fk"
            columns: ["salon_id"]
            referencedRelation: "salons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_subscription_type_id_fk"
            columns: ["subscription_type_id"]
            referencedRelation: "subscription_types"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar: string | null
          created_at: string
          email: string | null
          fullname: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          fullname?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fk"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_notification_receiver_type: "salons" | "customers" | "all"
      admin_notification_type: "info" | "warning" | "error"
      admin_status: "pending" | "approved" | "rejected"
      appointment_status:
        | "upcoming"
        | "past"
        | "cancelled"
        | "ongoing"
        | "rejected"
        | "accepted"
      boost_duration_enum: "daily" | "weekly" | "monthly"
      coupon_discount_type: "percentage" | "fixed"
      coupon_status: "active" | "inactive"
      duration_type: "daily" | "weekly" | "monthly"
      fcm_token_user_type: "salon" | "customer"
      notification_type:
        | "like_on_media"
        | "appointment_requested"
        | "appointment_accepted"
        | "appointment_rejected"
        | "appointment_reminder"
        | "new_review_posted"
        | "special_offer"
        | "post_media"
        | "post_story"
        | "new_message"
        | "new_post_comment"
        | "new_post_like"
        | "appointment_cancelled"
      payment_status_enum: "pending" | "paid"
      receiver_type: "customer" | "salon"
      source_type: "instagram" | "glambazaar"
      sponsor_type:
        | "influencer"
        | "bank"
        | "company"
        | "affiliate"
        | "internal"
        | "other"
      subscription_status: "active" | "cancelled" | "expired"
      user_type: "salon" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
