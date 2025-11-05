export interface Discount {
  id: string;
  salon_id: string;
  service_discount: number;
  deal_discount: number;
  package_discount: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountInsert {
  salon_id?: string;
  service_discount: number;
  deal_discount: number;
  package_discount: number;
}

export interface DiscountUpdate {
  salon_id?: string;
  service_discount?: number;
  deal_discount?: number;
  package_discount?: number;
}

export interface DiscountFormData {
  service_discount: number;
  deal_discount: number;
  package_discount: number;
}

