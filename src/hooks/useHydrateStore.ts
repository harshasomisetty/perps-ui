import { useGlobalStore } from "@/stores/store";
import { useEffect } from "react";
import { getCustodyData } from "./storeHelpers/fetchCustodies";
import { getPoolData } from "./storeHelpers/fetchPools";
import { getPositionData } from "./storeHelpers/fetchPositions";

export const useHydrateStore = () => {
  const setCustodyData = useGlobalStore((state) => state.setCustodyData);
  const setPoolData = useGlobalStore((state) => state.setPoolData);
  const setPositionData = useGlobalStore((state) => state.setPositionData);

  useEffect(() => {
    (async () => {
      const custodyInfos = await getCustodyData();
      const poolInfos = await getPoolData(custodyInfos);
      const positionInfos = await getPositionData(custodyInfos);

      // console.log("fetched the global store in hydrate", poolInfos);
      // console.log(
      //   "fetched the global custodies store in hydrate",
      //   custodyInfos
      // );
      // console.log(
      //   "fetched the global positionInfos store in hydrate",
      //   positionInfos
      // );

      setCustodyData(custodyInfos);
      setPoolData(poolInfos);
      setPositionData(positionInfos);
    })();
  }, []);
};
