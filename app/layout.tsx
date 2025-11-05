import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HireLab",
  description: "Generate precise Boolean search strings for talent sourcing across LinkedIn, GitHub, Stack Overflow, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', background: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  );
}
