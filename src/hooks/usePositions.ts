import { useEffect, useState } from "react";

import { Token } from "@/lib/Token";

export interface Position {
  id: string;
  collateral: number;
  entryPrice: number;
  leverage: number;
  liquidationPrice: number;
  liquidationThreshold: number;
  markPrice: number;
  pnlDelta: number;
  pnlDeltaPercent: number;
  size: number;
  timestamp: number;
  token: Token;
  type: "long" | "short";
  value: number;
  valueDelta: number;
  valueDeltaPercentage: number;
}

interface Pending {
  status: "pending";
}

interface Failure {
  status: "failure";
  error: Error;
}

interface Success {
  status: "success";
  data: Position[];
}

type Positions = Pending | Failure | Success;

/**
 * Placeholder method to grab current list of positions
 */
async function fetchPositions(): Promise<Success> {
  return {
    status: "success",
    data: [
      {
        id: "1",
        collateral: 90.19,
        entryPrice: 16.4,
        leverage: 15,
        liquidationPrice: 1458.93,
        liquidationThreshold: 1400.5,
        markPrice: 1400.5,
        pnlDelta: 0.16,
        pnlDeltaPercent: 1.93,
        size: 1400.5,
        timestamp: Date.now(),
        token: Token.SOL,
        type: "long",
        value: 15.48,
        valueDelta: 0.1635,
        valueDeltaPercentage: 0.99,
      },
      {
        id: "2",
        collateral: 90.19,
        entryPrice: 16.4,
        leverage: 15,
        liquidationPrice: 1458.93,
        liquidationThreshold: 1400.5,
        markPrice: 1400.5,
        pnlDelta: -0.16,
        pnlDeltaPercent: -1.93,
        size: 1400.5,
        timestamp: Date.now(),
        token: Token.Bonk,
        type: "short",
        value: 15.48,
        valueDelta: -0.1635,
        valueDeltaPercentage: -0.99,
      },
      {
        id: "3",
        collateral: 90.19,
        entryPrice: 16.4,
        leverage: 15,
        liquidationPrice: 1458.93,
        liquidationThreshold: 1400.5,
        markPrice: 1400.5,
        pnlDelta: 0.16,
        pnlDeltaPercent: 1.93,
        size: 1400.5,
        timestamp: Date.now(),
        token: Token.mSOL,
        type: "long",
        value: 15.48,
        valueDelta: 0.1635,
        valueDeltaPercentage: 0.99,
      },
    ],
  };
}

export function usePositions() {
  const [positions, setPositions] = useState<Positions>({ status: "pending" });

  useEffect(() => {
    fetchPositions()
      .then(setPositions)
      .catch((e) =>
        setPositions({
          status: "failure",
          error: e,
        })
      );
  }, []);

  return positions;
}
