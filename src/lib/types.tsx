import { TokenE } from "@/lib/Token";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface Pool {
  name: string;
  tokens: Token[];
  aumUsd: BN;
  bump: number;
  lpTokenBump: number;
  inceptionTime: BN;
}

export interface Token {
  custody: PublicKey;
  targetRatio: BN;
  minRatio: BN;
  maxRatio: BN;
}

export interface Custody {
  assets: Assets;
  borrowRate: BorrowRateParams;
  borrowRateState: BorrowRateState;
  bump: number;
  collectedFees: Stats;
  decimals: number;
  fees: Fees;
  isStable: boolean;
  longPositions: PositionStats;
  mint: PublicKey;
  oracle: OracleParams;
  permissions: Permissions;
  pool: PublicKey;
  pricing: PricingParams;
  shortPositions: PositionStats;
  tokenAccount: PublicKey;
  tokenAccountBump: number;
  tradeStats: TradeStats;
  volumeStats: Stats;
}

export interface BorrowRateParams {
  baseRate: BN;
  slope1: BN;
  slope2: BN;
  optimalUtilization: BN;
}

export interface BorrowRateState {
  currentRate: BN;
  cumulativeRate: BN;
  lastUpdate: BN;
}

export interface PositionStats {
  openPositions: BN;
  collateralUsd: BN;
  sizeUsd: BN;
  lockedAmount: BN;
  weightedLeverage: BN;
  totalLeverage: BN;
  cumulativeInterest: BN;
  cumulativeInterestSnapshot: BN;
}

// export interface TokenCustody {
//   custodyAccount: PublicKey;
//   tokenAccount: PublicKey;
//   mintAccount: PublicKey;
//   oracleAccount: PublicKey;
//   name: TokenE;
//   owned: BN;
//   locked: BN;
//   decimals: number;
//   targetRatio: number;
//   volume: VolumeStats;
//   oiLong: number;
//   oiShort: number;
//   feeStats: FeeStats;
//   fees: Fees;
//   rate: Rates;
// }

export interface Assets {
  collateral: BN;
  protocolFees: BN;
  owned: BN;
  locked: BN;
}

export interface Stats {
  swapUsd: BN;
  addLiquidityUsd: BN;
  removeLiquidityUsd: BN;
  openPositionUsd: BN;
  closePositionUsd: BN;
  liquidationUsd: BN;
}

export interface Fees {
  mode: FeesMode;
  maxIncrease: BN;
  maxDecrease: BN;
  swap: BN;
  addLiquidity: BN;
  removeLiquidity: BN;
  openPosition: BN;
  closePosition: BN;
  liquidation: BN;
  protocolShare: BN;
}

export enum FeesMode {
  Fixed,
  Linear,
}

export interface OracleParams {
  oracleAccount: PublicKey;
  oracleType: OracleType;
  maxPriceError: BN;
  maxPriceAgeSec: number;
}

export enum OracleType {
  None,
  Test,
  Pyth,
}

export interface Permissions {
  allowSwap: boolean;
  allowAddLiquidity: boolean;
  allowRemoveLiquidity: boolean;
  allowOpenPosition: boolean;
  allowClosePosition: boolean;
  allowPnlWithdrawal: boolean;
  allowCollateralWithdrawal: boolean;
  allowSizeChange: boolean;
}

export interface PricingParams {
  useEma: boolean;
  tradeSpreadLong: BN;
  tradeSpreadShort: BN;
  swapSpread: BN;
  minInitialLeverage: BN;
  maxLeverage: BN;
  maxPayoffMult: BN;
}

export interface TradeStats {
  profitUsd: BN;
  lossUsd: BN;
  oiLongUsd: BN;
  oiShortUsd: BN;
}

export enum Side {
  None = "None",
  Long = "Long",
  Short = "Short",
  Swap = "Swap",
}

export enum Tab {
  Add,
  Remove,
}

export interface AccountMeta {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}

export class TradeSide {
  static Long = { long: {} };
  static Short = { short: {} };
}

export interface Position {
  owner: PublicKey;
  pool: PublicKey;
  custody: PublicKey;
  lockCustody: PublicKey;

  openTime: BN;
  updateTime: BN;

  side: Side;
  price: BN;
  sizeUsd: BN;
  collateralUsd: BN;
  unrealizedProfitUsd: BN;
  unrealizedLossUsd: BN;
  cumulativeInterestSnapshot: BN;
  lockedAmount: BN;
  collateralAmount: BN;
}

interface PriceStat {
  change24hr: number;
  currentPrice: number;
  high24hr: number;
  low24hr: number;
}

export type PriceStats = Record<TokenE, PriceStat>;
