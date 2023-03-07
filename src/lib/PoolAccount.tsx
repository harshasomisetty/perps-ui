import { AllStats } from "@/hooks/useDailyPriceStats";
import { Custody, Pool } from "src/types";
import { tokenAddressToToken, TokenE } from "src/types/Token";

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

  getTokenList(): TokenE[] {
    return Object.keys(this.tokens).map((token) => {
      return tokenAddressToToken(token);
    });
  }

  getLiquidities(stats: AllStats) {
    // get liquidities from token custodies
    if (Object.keys(stats).length == 0) {
      return;
    }

    // console.log("stats account", stats);
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody) => {
        let singleLiq =
          stats[tokenCustody.name].currentPrice *
          ((Number(tokenCustody.owned) - Number(tokenCustody.locked)) /
            10 ** tokenCustody.decimals);
        return acc + singleLiq;
      },
      0
    );

    return totalAmount;
  }

  getTradeVolumes() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: Custody) => {
        return (
          acc +
          Object.values(tokenCustody.volumeStats).reduce(
            (acc, val) => Number(acc) + Number(val)
          )
        );
      },
      0
    );
    // console.log("totalAmount", totalAmount);

    return totalAmount / 10 ** 6;
  }

  getOiLong() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: Custody) => {
        return Number(acc) + Number(tokenCustody.oiLong);
      },
      0
    );

    return totalAmount / 10 ** 6;
  }

  getOiShort() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: Custody) => {
        return Number(acc) + Number(tokenCustody.oiShort);
      },
      0
    );

    return totalAmount / 10 ** 6;
  }

  getFees() {
    const totalAmount = Object.values(this.tokens).reduce(
      (acc: number, tokenCustody: Custody) => {
        return (
          acc +
          Object.values(tokenCustody.collectedFees).reduce(
            (acc, val) => Number(acc) + Number(val)
          )
        );
      },
      0
    );

    return totalAmount / 10 ** 6;
  }
}
