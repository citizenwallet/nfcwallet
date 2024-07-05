import { Inter } from "next/font/google";
import "~~/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NFC Wallet",
  description: "Turn any NFC tag into a wallet on Base",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning className={inter.className}>
        {children}
      </body>
    </html>
  );
}
