import type { Metadata } from "next";
import "./globals.css";
import Provider from "./provider";

export const metadata: Metadata = {
  title: "Logchain - Tamper-Proof Logs on Solana",
  description: "Blockchain-verified server logs with Solana integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{ fontFamily: "'Lucida Console', monospace" }}
        className="antialiased"
        suppressHydrationWarning
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
