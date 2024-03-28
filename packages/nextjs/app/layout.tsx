import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

export const metadata = {
  title: "NFC Wallet",
  description: "Turn any NFC tag into a wallet on Base",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <body suppressHydrationWarning>{children}</body>
      </ThemeProvider>
    </html>
  );
}
