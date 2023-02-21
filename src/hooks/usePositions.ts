import { useEffect } from "react";

import { tokenAddressToToken } from "@/lib/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { Position, UserPoolPositions, Side } from "@/lib/Position";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAppStore } from "@/stores/store";
import { shallow } from 'zustand/shallow'

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

  const { 
    positions, 
    setStorePositions
  } = useAppStore(
    (state) => ({ 
      positions: state.storePositions,
      setStorePositions: state.setStorePositions 
    }),
    shallow
  )

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

    fetchedPositions.forEach((position, index) => {
      let poolAddress = position.account.pool.toString();
      if (!organizedPositions[poolAddress]) {
        organizedPositions[poolAddress] = [];
      }
      let cleanedPosition: Position = {
        id: index.toString(),
        positionAccountAddress: position.publicKey.toBase58(),
        poolAddress: poolAddress,
        collateral: position.account.collateralUsd.toNumber(),
        entryPrice: position.account.openTime.toNumber(),
        leverage: 0,
        liquidationPrice: 0,
        liquidationThreshold: 0,
        markPrice: 0,
        pnlDelta: 0,
        pnlDeltaPercent: 0,
        size: position.account.sizeUsd.toNumber(),
        timestamp: Date.now(),
        token: tokenAddressToToken(fetchedCustodies[index].mint.toString()),
        side: position.account.side.hasOwnProperty("long")
          ? Side.Long
          : Side.Short,
        value: 0,
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
    setStorePositions(organizedPositionsObject)

  };

  useEffect(() => {
    fetchPositions();
  }, [publicKey]);

  return { positions, fetchPositions };
}
