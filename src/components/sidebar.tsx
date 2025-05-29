"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, Tag, Home, Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-primary-foreground p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:h-screen md:flex-shrink-0 overflow-y-auto flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="py-4 px-3 border-b border-sidebar-border">
          <Link href="/" className="flex items-center space-x-2 transition-all duration-200 hover:opacity-80">
            <div className="rounded-lg bg-sidebar-primary p-1.5 text-sidebar-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg inline-block bg-gradient-to-r from-sidebar-primary to-sidebar-primary/70 bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </Link>
        </div>

        {/* Sidebar navigation */}
        <nav className="py-4 px-3 space-y-3 flex-grow">
          {status === "authenticated" ? (
            <>
              <Button 
                asChild 
                variant={pathname === "/" ? "default" : "ghost"} 
                size="default" 
                className="w-full justify-start px-3"
              >
                <Link href="/" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button 
                asChild 
                variant={pathname.startsWith("/categories") ? "default" : "ghost"} 
                size="default" 
                className="w-full justify-start px-3"
              >
                <Link href="/categories" className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Categories
                </Link>
              </Button>
              <Button 
                asChild 
                variant={pathname === "/expenses/new" ? "default" : "ghost"} 
                size="default" 
                className="w-full justify-start px-3"
              >
                <Link href="/expenses/new" className="flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </Button>
            </>
          ) : status === "unauthenticated" ? (
            <Button 
              asChild 
              variant={pathname === "/auth/signin" ? "default" : "ghost"} 
              size="default" 
              className="w-full justify-start px-3"
            >
              <Link href="/auth/signin" className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          ) : (
            // Loading state - show a subtle loading indicator
            <div className="flex justify-center py-2">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-primary/40 rounded-full"></div>
                <div className="h-2 w-2 bg-primary/40 rounded-full"></div>
                <div className="h-2 w-2 bg-primary/40 rounded-full"></div>
              </div>
            </div>
          )}
        </nav>

        {/* User profile or sign in/up */}
        <div className="mt-auto py-5 px-3 border-t border-sidebar-border bg-sidebar-accent/5">
          {status === "authenticated" && session?.user ? (
            <div className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-2 border-2 border-primary/20">
                    {session.user.image ? (
                      <AvatarImage src={session.user.image} alt={session.user.name || ""} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {session.user.email}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign out"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : status === "unauthenticated" ? (
            <Button 
              asChild 
              variant="outline" 
              size="default" 
              className="w-full shadow-sm hover:shadow transition-all duration-200 px-3"
            >
              <Link href="/auth/signup" className="flex items-center justify-center">
                <User className="mr-2 h-4 w-4" />
                Create Account
              </Link>
            </Button>
          ) : (
            // Loading state - show a subtle loading indicator
            <div className="flex justify-center py-2">
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-primary/40 rounded-full"></div>
                <div className="h-2 w-2 bg-primary/40 rounded-full"></div>
                <div className="h-2 w-2 bg-primary/40 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
