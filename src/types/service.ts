export type Service = {
  id: string;
  name: string;
  salon_id: string;
  category_id: string | null;
  gender: string | null;
  price: number;
  starting_from: number | null;
  has_range: boolean | null;
  time: string;
  created_at: string;
  updated_at: string;
};
