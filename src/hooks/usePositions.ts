import { useEffect } from "react";

import { tokenAddressToToken } from "src/types/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { shallow } from "zustand/shallow";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/store";
import { Side } from "src/types";

interface Pending {
  status: "pending";
}

interface Failure {
  status: "failure";
  error: Error;
}

interface Success {
  status: "success";
  data: UserPoolPositions[];
}

export type PositionRequest = Pending | Failure | Success;

export function usePositions() {
  const { positions, setStorePositions } = useGlobalStore(
    (state) => ({
      positions: state.storePositions,
      setStorePositions: state.setStorePositions,
    }),
    shallow
  );
  const { publicKey, wallet } = useWallet();

  // if page is admin

  let allPositions = false;

  const router = useRouter();
  if (router.pathname.includes("admin")) {
    allPositions = true;
  }

  const fetchPositions = async () => {
    if (!wallet || !publicKey) {
      // console.log("no wallet or pubkey", publicKey);
      return;
    }

    let { perpetual_program } = await getPerpetualProgramAndProvider();

    let fetchedPools = await perpetual_program.account.pool.all();
    let poolNames: Record<string, string> = {};

    fetchedPools.forEach((pool) => {
      poolNames[pool.publicKey.toBase58()] = pool.account.name;
    });

    let fetchedPositions;

    // console.log("all positions", allPositions);
    if (allPositions) {
      fetchedPositions = await perpetual_program.account.position.all();
    } else {
      // console.log("user positions");
      fetchedPositions = await perpetual_program.account.position.all([
        {
          memcmp: {
            offset: 8,
            bytes: publicKey.toBase58(),
          },
        },
      ]);
    }
    // console.log("fetched positons", fetchedPositions);

    let custodyAccounts = fetchedPositions.map(
      (position) => position.account.custody
    );

    let fetchedCustodies =
      await perpetual_program.account.custody.fetchMultiple(custodyAccounts);

    // console.log("fetched custodies", fetchedCustodies);

    let organizedPositions: Record<string, Position[]> = {};

    // netvalue: collateral + profit - loss
    fetchedPositions.forEach(async (position, index) => {
      let poolAddress = position.account.pool.toString();
      if (!organizedPositions[poolAddress]) {
        organizedPositions[poolAddress] = [];
      }

      let cleanedPosition: Position = {
        poolName: poolNames[poolAddress],
        positionAccountAddress: position.publicKey,
        poolAddress: position.account.pool,
        collateralUsd: position.account.collateralUsd.toNumber() / 10 ** 6,

        entryPrice: position.account.price.toNumber() / 10 ** 6,

        leverage:
          position.account.sizeUsd.toNumber() /
          position.account.collateralUsd.toNumber(),

        // liquidationPrice: 0,
        // liquidationThreshold: 0,
        // markPrice: 0,
        // pnlDelta: 0,
        // pnlDeltaPercent: 0,
        sizeUsd: position.account.sizeUsd.toNumber() / 10 ** 6,
        timestamp: Date.now(),
        token: tokenAddressToToken(fetchedCustodies[index].mint.toString()),
        side: position.account.side.hasOwnProperty("long")
          ? Side.Long
          : Side.Short,
        valueDelta: 0,
        valueDeltaPercentage: 0,
      };

      organizedPositions[poolAddress]!.push(cleanedPosition);
    });

    let organizedPositionsObject: Success = {
      status: "success",
      data: Object.entries(organizedPositions).map(
        ([poolAddress, positions]) => {
          return {
            name: poolNames[poolAddress],
            tokens: positions.map((position) => position.token),
            positions: positions,
          };
        }
      ),
    };
    console.log("finalPositionObject:", organizedPositionsObject);
    setStorePositions(organizedPositionsObject);
  };

  useEffect(() => {
    fetchPositions();
  }, [publicKey]);

  return { positions, fetchPositions };
}
