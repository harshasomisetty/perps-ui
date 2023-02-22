import { AllStats } from "@/hooks/useDailyPriceStats";
import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Token } from "./Token";

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
  openPositionUsd: number;
  closePositionUsd: number;
}

export class CustodyObject {
  constructor(custody: TokenCustody) {
    this.custodyAccount = custody.custodyAccount;
    this.tokenAccount = custody.tokenAccount;
    this.mintAccount = custody.mintAccount;
    this.oracleAccount = custody.oracleAccount;
    this.name = custody.name;
    this.amount = custody.amount;
    this.decimals = custody.decimals;
    this.minRatio = custody.minRatio;
    this.maxRatio = custody.maxRatio;
  }
}

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
        return (
          acc + tokenCustody.openPositionUsd + tokenCustody.closePositionUsd
        );
      },
      0
    );

    return totalAmount.toFixed(2);
  }
}
