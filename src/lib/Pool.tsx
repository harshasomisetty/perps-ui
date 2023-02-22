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
  // liquidity: number;
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
  // userLiquitiy: number;
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
    // console.log("statsf", stats);

    // Object.values(this.tokens).forEach((tokenCustody) => {
    //   console.log("names?", tokenCustody.name);
    //   console.log("currrr price", stats[tokenCustody.name].currentPrice);
    //   let singleLiq =
    //     stats[tokenCustody.name].currentPrice *
    //     (Number(tokenCustody.amount) / 10 ** tokenCustody.decimals);
    //   console.log("single liq ", singleLiq, "token", tokenCustody.name);
    // });

    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody) => {
        let singleLiq =
          stats[tokenCustody.name].currentPrice *
          (Number(tokenCustody.amount) / 10 ** tokenCustody.decimals);
        console.log("single liq ", singleLiq, "token", tokenCustody.name);
        return acc + singleLiq;
      },
      0
    );

    console.log("total amount", totalAmount);

    return totalAmount.toFixed(2);
  }

  speak() {
    return this.poolName;
  }
}
