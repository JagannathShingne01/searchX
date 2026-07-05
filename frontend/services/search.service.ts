import { api } from "@/lib/axios";

import {
  ISearchResponse,
  SearchExplainResponse,
} from "@/types/search";

class SearchService {
  async search(params: {
    query: string;
    page?: number;
    limit?: number;
    brand?: string;
    category?: string;
  }): Promise<ISearchResponse> {
    const response = await api.get<ISearchResponse>("/search", {
      params: {
        q: params.query,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        brand: params.brand,
        category: params.category,
      },
    });

    return response.data;
  }

  async explain(query: string): Promise<SearchExplainResponse> {
    const response = await api.get<SearchExplainResponse>(
      "/search/explain",
      {
        params: {
          q: query,
        },
      }
    );

    return response.data;
  }
}

export const searchService = new SearchService();