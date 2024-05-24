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
      <body suppressHydrationWarning className={inter.className}>
        {children}
        <footer className="bg-gray-100">
          <div className=" container text-white text-center p-4 mt-8 flex justify-between items-center">
            <div>
              <a href="https://citizenwallet.xyz">
                <div className="flex justify-center items-center">
                  <img src="/citizenwallet-logo-icon.svg" alt="Citizen Wallet" className="w-6 h-6 mr-2" />
                  <img src="/citizenwallet-logo-text.svg" alt="Citizen Wallet" className="w-24 h-6 mr-2" />
                </div>
              </a>
            </div>
            <div className="text-xs text-gray-700">
              <a href="https://github.com/citizenwallet/nfcwallet" className="text-gray-500">
                github.com/citizenwallet/nfcwallet
              </a>
            </div>
          </div>
        </footer>
        <div className="text-center text-xs dark:text-gray-100 p-4">
          <a href="https://github.com/citizenwallet/nfcwallet/issues/new">report an issue</a>
        </div>
      </body>
    </html>
  );
}
