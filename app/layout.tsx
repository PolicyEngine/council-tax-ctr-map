import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Council Tax and CTR Map - PolicyEngine",
  description:
    "Explore council tax bills and modeled Council Tax Reduction across English billing authorities.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
