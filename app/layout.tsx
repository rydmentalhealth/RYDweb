import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/auth-provider";
import { ReactQueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "RYD – Refugees, Youth, and Persons with Disabilities",
  description: "Faith-based mental health care for refugees, youth, and persons with disabilities. Healing begins with faith.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <ReactQueryProvider>
          <NextAuthProvider>
            {children}
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
