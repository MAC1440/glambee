export type Service = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  originalPrice: number | null;
  duration: number | null;
  category: "Service" | "Deal" | "Promotion";
  includedServices?: { value: string; label: string }[];
};
