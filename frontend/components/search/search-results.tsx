"use client";

import { useSearch } from "@/hooks/use-search";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({
  query,
}: SearchResultsProps) {
  const { data, isLoading, isError } = useSearch({query});

  if (!query) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <h2 className="text-lg font-semibold">
          Search Results
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Start typing to search products.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border p-12 text-center">
        Searching...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border p-12 text-center text-red-500">
        Failed to load search results.
      </div>
    );
  }

  if (!data || data.products.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        No products found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.products.map((product) => (
        <div
          key={product.id}
          className="rounded-lg border p-4"
        >
          <h3 className="font-semibold">
            {product.name}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span>{product.category}</span>

            <span>{product.brand}</span>

            <span>${product.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
}