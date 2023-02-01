// export interface Pool {
//   id: string;
//   tokens: Token[];
//   name: string;
// }

import { PublicKey } from "@solana/web3.js";
import { Token } from "./Token";

export interface TokenCustody {
  custodyAccount: PublicKey;
  tokenAccount: PublicKey;
  mintAccount: PublicKey;
  oracleAccount: PublicKey;
  name: Token;
  // liquidity: number;
}

export interface CustodyMeta {
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
}

export interface Pool {
  name: string;
  poolAddress: PublicKey;
  lpTokenMint: PublicKey;
  tokens: Record<string, TokenCustody>; // string is token mint address
  tokenNames: Token[];
  custodyMetas: CustodyMeta[];
  // volume: number;
  // fees: number; // 7 days
  // oiLong: number;
  // oiShort: number;
  // userLiquitiy: number;
  // userShare: number;
}
