"use client";

import { useState } from "react";

import { SearchInput } from "@/components/search/search-input";
import { SearchResults } from "@/components/search/search-results";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Search Playground
          </h1>

          <p className="mt-2 text-muted-foreground">
            Explore how SearchX processes autocomplete queries using
            Redis, Elasticsearch, and production-ready search architecture.
          </p>
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
        />
      </section>

      <SearchResults query={query} />
    </div>
  );
}