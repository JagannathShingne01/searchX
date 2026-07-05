"use client";

import { useQuery } from "@tanstack/react-query";

import { searchService } from "@/services/search.service";

interface UseSearchParams {
  query: string;
  page?: number;
  limit?: number;
  brand?: string;
  category?: string;
}

export function useSearch({
  query,
  page = 1,
  limit = 10,
  brand,
  category,
}: UseSearchParams) {
  return useQuery({
    queryKey: [
      "search",
      query,
      page,
      limit,
      brand,
      category,
    ],

    queryFn: () =>
      searchService.search({
        query,
        page,
        limit,
        brand,
        category,
      }),

    enabled: query.trim().length > 0,
  });
}