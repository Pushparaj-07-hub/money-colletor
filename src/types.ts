export type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
};

export type Shop = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  area: string;
  notes: string;
  active: boolean;
  createdAt: string;
};

export type SupplyItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

export type Supply = {
  id: string;
  shopId: string;
  date: string;
  items: SupplyItem[];
  total: number;
  notes: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  shopId: string;
  date: string;
  amount: number;
  method: string;
  notes: string;
  createdAt: string;
};

export type Settings = {
  businessName: string;
  ownerName: string;
  phone: string;
  address: string;
  currency: string;
  darkMode: boolean;
};

export type AppData = {
  shops: Shop[];
  products: Product[];
  supplies: Supply[];
  payments: Payment[];
  settings: Settings;
};