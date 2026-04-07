import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HIRELab",
    template: "%s | HIRELab",
  },
  description:
    "Generate precise Boolean search strings for talent sourcing across LinkedIn, GitHub, Stack Overflow, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
