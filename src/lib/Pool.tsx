import { AllStats } from "@/hooks/useDailyPriceStats";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Token } from "./Token";

interface VolumeStats {
  swap: number;
  addLiquidity: number;
  removeLiquidity: number;
  openPosition: number;
  closePosition: number;
  liquidation: number;
}

interface FeeStats {
  swap: number;
  addLiquidity: number;
  removeLiquidity: number;
  openPosition: number;
  closePosition: number;
  liquidation: number;
}

export interface TokenCustody {
  custodyAccount: PublicKey;
  tokenAccount: PublicKey;
  mintAccount: PublicKey;
  oracleAccount: PublicKey;
  name: Token;
  amount: BN;
  decimals: number;
  minRatio: number;
  maxRatio: number;

  volume: VolumeStats;

  oiLong: number;
  oiShort: number;

  fees: FeeStats;
}

// export class CustodyObject {
//   constructor(custody: TokenCustody) {
//     this.custodyAccount = custody.custodyAccount;
//     this.tokenAccount = custody.tokenAccount;
//     this.mintAccount = custody.mintAccount;
//     this.oracleAccount = custody.oracleAccount;
//     this.name = custody.name;
//     this.amount = custody.amount;
//     this.decimals = custody.decimals;
//     this.minRatio = custody.minRatio;
//     this.maxRatio = custody.maxRatio;
//   }
// }

export interface CustodyMeta {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}

export interface Pool {
  poolName: string;
  poolAddress: PublicKey;
  lpTokenMint: PublicKey;
  tokens: Record<string, TokenCustody>; // string is token mint address
  tokenNames: Token[];
  custodyMetas: CustodyMeta[];
  lpDecimals: number;
  // volume: number;
  // fees: number; // 7 days
  // oiLong: number;
  // oiShort: number;
  userLiquidity: number;
  // userShare: number;
}

export class PoolObj {
  constructor(pool: Pool) {
    this.poolName = pool.poolName;
    this.poolAddress = pool.poolAddress;
    this.lpTokenMint = pool.lpTokenMint;
    this.tokens = pool.tokens;
    this.tokenNames = pool.tokenNames;
    this.custodyMetas = pool.custodyMetas;
    this.lpDecimals = pool.lpDecimals;
  }

  getLiquidities(stats: AllStats) {
    // get liquidities from token custodies
    if (stats === undefined) {
      return;
    }

    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody) => {
        let singleLiq =
          stats[tokenCustody.name].currentPrice *
          (Number(tokenCustody.amount) / 10 ** tokenCustody.decimals);
        return acc + singleLiq;
      },
      0
    );

    return totalAmount.toFixed(2);
  }

  getTradeVolumes() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: TokenCustody) => {
        console.log("reducer", acc, tokenCustody.volume);
        return (
          acc +
          Object.values(tokenCustody.volume).reduce((acc, val) => acc + val)
        );
      },
      0
    );

    console.log("volume totalAmount", totalAmount);

    return (totalAmount / 10 ** 6).toFixed(2);
  }

  getOiLong() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: TokenCustody) => {
        return acc + tokenCustody.oiLong;
      },
      0
    );

    return (totalAmount / 10 ** 6).toFixed(2);
  }

  getOiShort() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: TokenCustody) => {
        return acc + tokenCustody.oiShort;
      },
      0
    );

    return (totalAmount / 10 ** 6).toFixed(2);
  }

  getFees() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: TokenCustody) => {
        return (
          acc + Object.values(tokenCustody.fees).reduce((acc, val) => acc + val)
        );
      },
      0
    );

    return (totalAmount / 10 ** 6).toFixed(2);
  }
}
