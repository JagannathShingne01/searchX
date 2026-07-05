import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { QueryProvider } from "@/providers/query-provider";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactNode } from "react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SearchX",
  description: "Production Ready Search Engine",
};
interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps){
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <TooltipProvider>

            <SidebarProvider>
              <AppSidebar />

              <SidebarInset>
                <AppHeader />

                <PageContainer>
                  {children}
                </PageContainer>
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>

        </QueryProvider>
      </body>
    </html>
  );
}