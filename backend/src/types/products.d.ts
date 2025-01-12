export interface Product {
  title: string;
  sku: string;
  image: string;
  price: number;
  description: string | null;
  stock: number;
}

export interface CreateProduct {
  title: string;
  sku: string;
  image: string;
  price: number;
  description?: string | null;
}
