import { GeckoStats } from "@/hooks/useDailyPriceStats";
import { tokenAddressToToken, TokenE } from "@/lib/Token";
import { AccountMeta, Pool, Token } from "@/lib/types";
import { PERPETUALS_PROGRAM_ID } from "@/utils/constants";
import { BN } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Mint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { CustodyAccount } from "./CustodyAccount";

export class PoolAccount {
  public name: string;
  public tokens: Token[];
  public aumUsd: BN;
  public bump: number;
  public lpTokenBump: number;
  public inceptionTime: BN;

  public custodies: Record<string, CustodyAccount>;
  public address: PublicKey;

  // public lpDecimals: number = 8;
  public lpData: Mint;

  constructor(
    pool: Pool,
    custodies: Record<string, CustodyAccount>,
    address: PublicKey,
    lpData: Mint
  ) {
    this.name = pool.name;
    this.tokens = pool.tokens;
    this.aumUsd = pool.aumUsd;
    this.bump = pool.bump;
    this.lpTokenBump = pool.lpTokenBump;
    this.inceptionTime = pool.inceptionTime;

    let tempCustodies: Record<string, CustodyAccount> = {};
    pool.tokens.forEach((token) => {
      tempCustodies[token.custody.toString()] =
        custodies[token.custody.toString()]!;
    });

    this.custodies = tempCustodies;

    this.address = address;
    this.lpData = lpData;
  }

  getCustodyStruct(publicKey: PublicKey): Token | undefined {
    const token = this.tokens.find((t) => t.custody.equals(publicKey));
    return token ?? this.tokens[0];
  }

  getCustodyAccount(token: TokenE): CustodyAccount | null {
    return (
      Object.values(this.custodies).find(
        (custody) => custody.getTokenE() === token
      ) ?? null
    );
  }

  getPoolAddress(): PublicKey {
    return findProgramAddressSync(
      [Buffer.from("pool"), Buffer.from(this.name)],
      PERPETUALS_PROGRAM_ID
    )[0];
  }

  getLpTokenMint(): PublicKey {
    return findProgramAddressSync(
      [Buffer.from("lp_token_mint"), this.getPoolAddress().toBuffer()],
      PERPETUALS_PROGRAM_ID
    )[0];
  }

  getTokenList(): TokenE[] {
    return Object.values(this.custodies).map((custody) => {
      return custody?.getTokenE()!;
    });
  }

  getCustodyMetas(): AccountMeta[] {
    let custodyMetas: AccountMeta[] = [];

    Object.keys(this.custodies).forEach((custody) => {
      custodyMetas.push({
        pubkey: new PublicKey(custody),
        isSigner: false,
        isWritable: true,
      });
    });

    Object.values(this.custodies).forEach((custody) => {
      custodyMetas.push({
        pubkey: custody.oracle.oracleAccount,
        isSigner: false,
        isWritable: true,
      });
    });

    return custodyMetas;
  }
  getLiquidities(stats: GeckoStats): number | null {
    // get liquidities from token custodies
    if (Object.keys(stats).length == 0) {
      return null;
    }

    const totalAmount = Object.values(this.custodies).reduce(
      (acc: number, tokenCustody: CustodyAccount) => {
        // @ts-ignore
        let singleLiq =
          // @ts-ignore
          stats[tokenAddressToToken(tokenCustody.mint.toString())]
            .currentPrice *
          ((Number(tokenCustody.assets.owned) -
            Number(tokenCustody.assets.locked)) /
            10 ** tokenCustody.decimals);
        return acc + singleLiq;
      },
      0
    );

    return totalAmount;
  }

  getTradeVolumes(): number {
    const totalAmount = Object.values(this.custodies).reduce(
      (acc: number, tokenCustody: CustodyAccount) => {
        return (
          acc +
          Object.values(tokenCustody.volumeStats).reduce(
            (acc, val) => Number(acc) + Number(val)
          )
        );
      },
      0
    );

    return totalAmount / 10 ** 6;
  }

  getOiLong(): number {
    const totalAmount = Object.values(this.custodies).reduce(
      (acc: number, tokenCustody: CustodyAccount) => {
        return Number(acc) + Number(tokenCustody.tradeStats.oiLongUsd);
      },
      0
    );

    return totalAmount / 10 ** 6;
  }

  getOiShort(): number {
    const totalAmount = Object.values(this.custodies).reduce(
      (acc: number, tokenCustody: CustodyAccount) => {
        return Number(acc) + Number(tokenCustody.tradeStats.oiShortUsd);
      },
      0
    );

    return totalAmount / 10 ** 6;
  }

  getFees(): number {
    const totalAmount = Object.values(this.custodies).reduce(
      (acc: number, tokenCustody: CustodyAccount) => {
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
