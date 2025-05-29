"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Tag, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container px-5 sm:px-8 md:px-12 lg:px-16 flex h-16 items-center">
        <div className="mr-6 flex">
          <Link href="/" className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
            <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-3">
            <Button 
              asChild 
              variant={pathname === "/" ? "default" : "ghost"} 
              size="sm" 
              className="hidden md:flex"
            >
              <Link href="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button 
              asChild 
              variant={pathname.startsWith("/categories") ? "default" : "ghost"} 
              size="sm" 
              className="hidden md:flex"
            >
              <Link href="/categories" className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button asChild variant="default" size="sm" className="shadow-sm transition-all duration-200 hover:shadow">
              <Link href="/expenses/new" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Expense
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
