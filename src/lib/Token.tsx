import { SolanaIconCircle } from "@/components/SolanaIconCircle";
import { UsdcIconCircle } from "@/components/UsdcIconCircle";
import { MSolIconCircle } from "@/components/MSolIconCircle";
import { STSolIconCircle } from "@/components/STSolIconCircle";
import { RayIconCircle } from "@/components/RayIconCircle";
import { UsdtIconCircle } from "@/components/UsdtIconCircle";
import { OrcaIconCircle } from "@/components/OrcaIconCircle";
import { BonkIconCircle } from "@/components/BonkIconCircle";

export enum Token {
  SOL = "SOL",
  mSOL = "mSOL",
  stSOL = "stSOL",
  USDC = "USDC",
  USDT = "USDT",
  RAY = "RAY",
  ORCA = "ORCA",
  Bonk = "Bonk",
}

export function getTokenLabel(token: Token) {
  switch (token) {
    case Token.SOL:
      return "Solana";
    case Token.USDC:
      return "UDC Coin";
    case Token.mSOL:
      return "Marinade Staked SOL";
    case Token.stSOL:
      return "Lido Staked SOL";
    case Token.RAY:
      return "Raydium";
    case Token.USDT:
      return "USDT";
    case Token.ORCA:
      return "Orca";
    case Token.Bonk:
      return "BonkCoin";
  }
}

export function getTokenIcon(token: Token) {
  switch (token) {
    case Token.SOL:
      return <SolanaIconCircle />;
    case Token.USDC:
      return <UsdcIconCircle />;
    case Token.mSOL:
      return <MSolIconCircle />;
    case Token.stSOL:
      return <STSolIconCircle />;
    case Token.RAY:
      return <RayIconCircle />;
    case Token.USDT:
      return <UsdtIconCircle />;
    case Token.ORCA:
      return <OrcaIconCircle />;
    case Token.Bonk:
      return <BonkIconCircle />;
  }
}
