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
  const { publicKey, wallet } = useWallet();

  useEffect(() => {
    (async () => {
      // console.log("in hydrate fetching global data");
      const custodyData = await getCustodyData();
      const poolData = await getPoolData(custodyData);
      const positionInfos = await getPositionData(custodyData);

      // console.log("fetched the global store in hydrate", poolData);
      // console.log(
      //   "fetched the global custodies store in hydrate",
      //   custodyInfos
      // );
      // console.log(
      //   "fetched the global positionInfos store in hydrate",
      //   positionInfos
      // );

      setCustodyData(custodyData);
      setPoolData(poolData);
      setPositionData(positionInfos);
    })();
  }, []);

  useEffect(() => {
    console.log(
      "testing if runs",
      publicKey,
      Object.values(poolData).length > 0
    );
    if (publicKey && Object.values(poolData).length > 0) {
      (async () => {
        console.log("in hydrate fetching user data");
        const userData = await getAllUserData(connection, publicKey, poolData);
        console.log("got suer data", userData);
        setUserData(userData);
      })();
    }
  }, [publicKey, poolData]);
};
