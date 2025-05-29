"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  if (isAuthPage) {
    // For auth pages, don't render the sidebar
    return (
      <div className="min-h-screen relative">
        {/* Theme toggle in top right corner for auth pages */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </div>
    );
  }

  // For regular pages, render the sidebar
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Theme toggle in top right corner */}
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main className="flex-1 py-6 px-5 sm:px-8 md:px-8 lg:px-12 md:pt-6 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
