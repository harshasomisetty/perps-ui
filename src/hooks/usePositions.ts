import { useEffect, useState } from "react";

import { Token, tokenAddressToToken } from "@/lib/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import {
  Position,
  PoolPositions,
  UserPoolPositions,
  Side,
} from "@/lib/Position";
import { Wallet } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface Pending {
  status: "pending";
}

interface Failure {
  status: "failure";
  error: Error;
}

interface Success {
  status: "success";
  data: Record<string, UserPoolPositions[]>;
}

type PositionRequest = Pending | Failure | Success;

export function usePositions(wallet: Wallet) {
  const [positions, setPositions] = useState<PositionRequest>({
    status: "pending",
  });

  const { publicKey, wallet } = useWallet();

  const fetchPositions = async () => {
    if (!wallet) return;
    let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

    // const owner = new PublicKey('HKU5tpotzMbhABVtnvsrStu5gxZt82q67rWpCUJQf439');
    if (!publicKey) {
      return;
    }

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

    console.log("fetched custodies", fetchedCustodies);

    // TODO: fix proper token index from pool tokens and need to handle BN , either change the type to have BNs or handle conversion of BN to number here
    // toNumber is bad to use
    let cleanedPositions: Array<Position> = fetchedPositions.map(
      (position, index) => {
        return {
          id: index.toString(),
          positionAccountAddress: position.publicKey.toBase58(),
          poolAddress: position.account.pool.toBase58(),
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
          type: position.account.side.hasOwnProperty("long") ? "Long" : "Short",
          value: 0,
          valueDelta: 0,
          valueDeltaPercentage: 0,
        };
      }
    );
    const positionsObject: any = {
      status: "success",
      data: [
        {
          id: "1",
          name: "Test pool 1",
          tokens: [Token.SOL],
          positions: cleanedPositions,
        },
      ],
    };
    console.log("positionObject:", positionsObject);
    setPositions(positionsObject);
  };

  useEffect(() => {
    fetchPositions();
  }, [publicKey]);

  return { positions, fetchPositions };
}
