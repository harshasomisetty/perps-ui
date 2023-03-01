import { Token } from "./Token";

export enum Side {
  None = "None",
  Long = "Long",
  Short = "Short",
}

export class TradeSide {
  static Long = { long: {} };
  static Short = { short: {} };
}

export interface Position {
  id: string;
  positionAccountAddress: string;
  poolAddress: string;
  collateralUsd: number;
  entryPrice: number;
  leverage: number;
  // liquidationPrice: number;
  // liquidationThreshold: number;
  // markPrice: number;
  // pnlDelta: number;
  // pnlDeltaPercent: number;
  sizeUsd: number;
  timestamp: number;
  token: Token;
  side: Side;
  value: number;
  valueDelta: number;
  valueDeltaPercentage: number;
}

export interface UserPoolPositions {
  name: string;
  tokens: Token[];
  positions: Position[];
}
