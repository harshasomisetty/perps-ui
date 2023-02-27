import { useEffect } from "react";

import { tokenAddressToToken } from "@/lib/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { Position, UserPoolPositions, Side } from "@/lib/Position";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePositionStore } from "@/stores/store";
import { shallow } from "zustand/shallow";

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
  const { positions, setStorePositions } = usePositionStore(
    (state) => ({
      positions: state.storePositions,
      setStorePositions: state.setStorePositions,
    }),
    shallow
  );

  const { publicKey, wallet } = useWallet();

  const fetchPositions = async () => {
    if (!wallet) return;
    if (!publicKey) {
      return;
    }

    let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

    let fetchedPools = await perpetual_program.account.pool.all();
    let poolNames: Record<string, string> = {};

    fetchedPools.forEach((pool) => {
      poolNames[pool.publicKey.toBase58()] = pool.account.name;
    });

    let fetchedPositions = await perpetual_program.account.position.all([
      {
        memcmp: {
          offset: 8,
          bytes: publicKey.toBase58(),
        },
      },
    ]);

    console.log("fetched positons", fetchedPositions);

    let custodyAccounts = fetchedPositions.map(
      (position) => position.account.custody
    );

    let fetchedCustodies =
      await perpetual_program.account.custody.fetchMultiple(custodyAccounts);

    // console.log("fetched custodies", fetchedCustodies);

    let organizedPositions: Record<string, Position[]> = {};

    fetchedPositions.forEach(async (position, index) => {
      let poolAddress = position.account.pool.toString();
      if (!organizedPositions[poolAddress]) {
        organizedPositions[poolAddress] = [];
      }

      let cleanedPosition: Position = {
        id: index.toString(),
        // borrowRateSum: position.account.borrowRateSum.toNumber(),
        positionAccountAddress: position.publicKey,
        poolAddress: position.account.pool,
        collateralUsd: position.account.collateralUsd.toNumber() / 10 ** 6,

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
          positions.forEach((position) =>
            console.log("position", position.side)
          );
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
