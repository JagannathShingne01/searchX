export interface SearchProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  id: string;
  sku: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
}
