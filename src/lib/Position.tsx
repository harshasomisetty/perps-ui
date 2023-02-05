import { Token } from "./Token";

export enum Side {
  None,
  Long,
  Short,
}

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

export interface PositionPool {
  id: string;
  name: string;
  tokens: Token[];
  positions: Position[];
}
