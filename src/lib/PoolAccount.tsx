import { AllStats } from "@/hooks/useDailyPriceStats";
import { BN } from "@project-serum/anchor";
import { AccountMeta, Custody, Pool } from "src/types";

export class PoolAccount {
  public name: string;
  public poolAddress: string;
  public lpTokenMint: string;
  public tokens: Record<string, Custody>;
  public custodyMetas: AccountMeta[];
  public lpDecimals: number;
  public lpSupply: BN;

  constructor(pool: Pool) {
    this.name = pool.name;
    this.poolAddress = pool.poolAddress;
    this.lpTokenMint = pool.lpTokenMint;
    this.tokens = pool.tokens;
    this.custodyMetas = pool.custodyMetas;
    this.lpDecimals = pool.lpDecimals;
    this.lpSupply = pool.lpSupply;
  }

  getTokenNames() {
    return Object.values(this.tokens).map((tokenCustody) => tokenCustody.name);
  }

  getLiquidities(stats: AllStats) {
    // get liquidities from token custodies
    if (stats === undefined) {
      return;
    }

    // console.log("stats", stats);
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: BN, tokenCustody) => {
        let singleLiq =
          stats[tokenCustody.name].currentPrice *
          ((Number(tokenCustody.owned) - Number(tokenCustody.locked)) /
            10 ** tokenCustody.decimals);
        return acc + singleLiq;
      },
      new BN(0)
    );

    return totalAmount;
  }

  getTradeVolumes() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: BN, tokenCustody: Custody) => {
        return (
          acc +
          Object.values(tokenCustody.volumeStats).reduce(
            (acc, val) => acc + val
          )
        );
      },
      new BN(0)
    );

    return totalAmount;
  }

  getOiLong() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: BN, tokenCustody: Custody) => {
        return acc + tokenCustody.oiLong;
      },
      new BN(0)
    );

    return totalAmount;
  }

  getOiShort() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: BN, tokenCustody: Custody) => {
        return acc + tokenCustody.oiShort;
      },
      new BN(0)
    );

    return totalAmount;
  }

  getFees() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: BN, tokenCustody: Custody) => {
        return (
          acc +
          Object.values(tokenCustody.collectedFees).reduce(
            (acc, val) => acc + val
          )
        );
      },
      new BN(0)
    );

    return totalAmount;
  }
}

// interface Rates {
//   currentRate: number;
// }

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

// export interface CustodyMeta {
//   pubkey: PublicKey;
//   isSigner: boolean;
//   isWritable: boolean;
// }

// export interface Pool {
//   poolAddress: PublicKey;
//   custodyMetas: CustodyMeta[];
//   lpSupply: number;
// }
