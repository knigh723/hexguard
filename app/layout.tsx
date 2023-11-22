import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import favicon from "@/public/favicon.svg";
import Provider from "./providers/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hex Guard",
  description: "A Password Manager",
  icons: favicon,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <Provider>
        <body className={inter.className}>{children}</body>
      </Provider>
    </html>
  );
}
