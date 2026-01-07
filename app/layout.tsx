import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-clash",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-satoshi",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Anna & Moe Try Things",
  description: "The definitive ranking list for everything we try together.",
  keywords: ["ranking", "reviews", "comparison", "food", "products", "experiences"],
  authors: [{ name: "Anna & Moe" }],
  openGraph: {
    title: "Anna & Moe Try Things",
    description: "The definitive ranking list for everything we try together.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#b31d42" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0d0d0d" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="font-[family-name:var(--font-satoshi)] antialiased">
        {children}
      </body>
    </html>
  );
}
