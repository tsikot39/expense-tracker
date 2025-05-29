"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useState, useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Prevent hydration issues by rendering without theme classes on initial render
    return <>{children}</>;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}
