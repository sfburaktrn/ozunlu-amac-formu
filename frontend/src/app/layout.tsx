import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested for premium look
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stratejik Amac Belirleme Formu",
  description: "Kurumsal stratejik amac belirleme ve analiz platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} min-h-screen bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
