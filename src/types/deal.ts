import { Database } from "@/lib/supabase/supabase";

export type Deal = Database['public']['Tables']['salons_deals']['Row'];
export type DealInsert = Database['public']['Tables']['salons_deals']['Insert'];
export type DealUpdate = Database['public']['Tables']['salons_deals']['Update'];

export interface DealWithSalon extends Deal {
  salon?: {
    id: string;
    name: string | null;
    address: string | null;
  };
}

export interface DealFilters {
  salonId?: string;
  search?: string;
  isActive?: boolean;
  hasPopup?: boolean;
  limit?: number;
  offset?: number;
}

export interface DealFormData {
  title: string;
  price: number | null;
  discounted_price: number | null;
  prices_may_vary: boolean;
  valid_from: string | null;
  valid_till: string | null;
  media_url: string | null;
  dealpopup: boolean;
  popup_title: string | null;
  popup_price: number | null;
  popup_color: string | null;
  popup_template: string | null;
}

export interface PopupSettings {
  popup_title: string;
  popup_price?: number | null;
  popup_color?: string | null;
  popup_template?: string | null;
}
