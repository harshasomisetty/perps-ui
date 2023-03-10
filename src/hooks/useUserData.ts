import { useGlobalStore } from "@/stores/store";
import { fetchLPBalance } from "@/utils/retrieveData";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export function useUserData() {
  const [userLpTokens, setUserLpTokens] = useState<Record<string, number>>({});
  const poolData = useGlobalStore((state) => state.poolData);

  const { publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  const fetchUserData = async () => {
    if (!wallet) return;
    if (!publicKey) {
      return;
    }

    let lpTokenAccounts: Record<string, number> = {};
    let promises = Object.values(poolData).map(async (pool) => {
      lpTokenAccounts[pool.address.toString()] = await fetchLPBalance(
        pool.getLpTokenMint(),
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
