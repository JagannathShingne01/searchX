"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { navigation } from "@/constants/navigation";


export function AppHeader() {
  const pathname = usePathname();

  const currentPage = useMemo(() => {
    return (
      navigation.find((item) => item.href === pathname)?.title ?? "SearchX"
    );
  }, [pathname]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {currentPage}
        </h1>

        <p className="text-sm text-muted-foreground">
          Production Ready Search Engine
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}

        {/* GitHub */}

        {/* Backend Status */}
      </div>
    </header>
  );
}