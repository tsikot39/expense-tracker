import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SidebarWrapper } from "@/components/sidebar-wrapper";
import { ThemeProvider } from "@/components/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track and manage your expenses easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased min-h-screen bg-background`}
      >
        <AuthProvider>
          <ThemeProvider>
            <SidebarWrapper>
              {children}
            </SidebarWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
