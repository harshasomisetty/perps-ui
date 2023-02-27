import { Connection } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export async function getProvider(wallet: AnchorWallet, network: string = "devnet") {
  let network_url;
  if (network === "devnet") {
    network_url = "https://api.devnet.solana.com";
  } else {
    network_url = "http://localhost:8899";
  }

  const connection = new Connection(network_url, {
    commitment: "processed",
  });

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "processed",
    skipPreflight: true,
  });
  return provider;
}
