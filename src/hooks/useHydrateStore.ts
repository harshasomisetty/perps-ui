import { getAllUserData } from "@/hooks/storeHelpers/fetchUserData";
import { useGlobalStore } from "@/stores/store";
import { publicKey } from "@coral-xyz/borsh";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { getCustodyData } from "./storeHelpers/fetchCustodies";
import { getPoolData } from "./storeHelpers/fetchPools";
import { getPositionData } from "./storeHelpers/fetchPositions";

export const useHydrateStore = () => {
  const setCustodyData = useGlobalStore((state) => state.setCustodyData);
  const setPoolData = useGlobalStore((state) => state.setPoolData);
  const setPositionData = useGlobalStore((state) => state.setPositionData);

  const poolData = useGlobalStore((state) => state.poolData);

  const setUserData = useGlobalStore((state) => state.setUserData);

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    (async () => {
      const custodyData = await getCustodyData();
      const poolData = await getPoolData(custodyData);
      const positionInfos = await getPositionData(custodyData);

      setCustodyData(custodyData);
      setPoolData(poolData);
      setPositionData(positionInfos);
    })();
  }, []);

  useEffect(() => {
    if (publicKey && Object.values(poolData).length > 0) {
      (async () => {
        const userData = await getAllUserData(connection, publicKey, poolData);
        setUserData(userData);
      })();
    }
  }, [publicKey, poolData]);
};
