import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@libnyanpasu/material-design-libs";
import { MDProvider } from "@libnyanpasu/material-design-react";
import { ThemeProvider } from "@/components/providers/theme-provider";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const notoMono = Noto_Sans_Mono({
  variable: "--font-noto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Miku UI Download",
  description: "Third-party Miku UI download sites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          notoSans.variable,
          notoMono.variable,
          `dark:bg-on-surface antialiased`,
        )}
      >
        <MDProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </MDProvider>
      </body>
    </html>
  );
}
