import { useUserStore } from "@/stores/userStore";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { fetchLPBalance } from "@/utils/retrieveData";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export function useUserData() {
  const [userLpTokens, setUserLpTokens] = useState<Record<string, number>>({});

  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  const fetchUserData = async () => {
    if (!wallet) return;
    if (!publicKey) {
      return;
    }

    let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

    let fetchedPools = await perpetual_program.account.pool.all();

    let lpTokenAccounts: Record<string, number> = {};

    let promises = fetchedPools.map(async (pool) => {
      let lpTokenMint = findProgramAddressSync(
        ["lp_token_mint", pool.publicKey.toBuffer()],
        perpetual_program.programId
      )[0];

      lpTokenAccounts[pool.publicKey.toString()] = await fetchLPBalance(
        lpTokenMint,
        publicKey,
        connection
      );
    });

    await Promise.all(promises);

    setUserLpTokens(lpTokenAccounts);
  };

  useEffect(() => {
    fetchUserData();
  }, [publicKey]);

  return { userLpTokens };
}
