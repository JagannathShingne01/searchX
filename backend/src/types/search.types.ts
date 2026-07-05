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

export interface SearchMeta {
  cache: "HIT" | "MISS";
  searchEngine: "redis" | "elasticsearch";
  searchTimeMs: number;
  searchVersion: string;
}

export interface ISearchResponse {
  products: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta: SearchMeta;
}

export interface SearchExplainResponse {
  query: string;
  strategy: {
    autocomplete: {
      enabled: boolean;
      type: string;
      boost: number;
    };
    brand: {
      enabled: boolean;
      boost: number;
    };
    category: {
      enabled: boolean;
      boost: number;
    };
    fuzzy: {
      enabled: boolean;
      boost: number;
      fuzziness: string;
    };
    ranking: {
      enabled: boolean;
      formula: string;
    };
  };
  supportedFilters: string[];
  pagination: {
    maxLimit: number;
  };

}