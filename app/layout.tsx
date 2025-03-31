import type { Metadata } from "next";
import "@/public/globals.css";

export const metadata: Metadata = {
  title: "Species Map",
  description: "Species map",
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
