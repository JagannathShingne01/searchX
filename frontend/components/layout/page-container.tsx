import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <main className="flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        {children}
      </div>
    </main>
  );
}