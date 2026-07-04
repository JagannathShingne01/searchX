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
  suggest: {
    input: string[];
  };
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
  popularityScore?: number;
}

export interface ISearchResponse {
  products: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}