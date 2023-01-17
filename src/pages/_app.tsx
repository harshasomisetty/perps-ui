import "@/styles/globals.css";
import React, { ReactNode } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { AppProps } from "next/app";
import { FC, useMemo } from "react";

require("@solana/wallet-adapter-react-ui/styles.css");

import { Navbar } from "@/components/Navbar";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Context>
      <Navbar />
      <Component {...pageProps} />
    </Context>
  );
}

const Context: FC<{ children: ReactNode }> = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const endpoint = useMemo(() => "http://localhost:8899");

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <div className="min-h-screen bg-black pt-14">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  );
};
