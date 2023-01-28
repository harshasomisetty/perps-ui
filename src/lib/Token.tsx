import { SolanaIconCircle } from "@/components/Icons/SolanaIconCircle";
import { UsdcIconCircle } from "@/components/Icons/UsdcIconCircle";
import { MSolIconCircle } from "@/components/Icons/MSolIconCircle";
import { STSolIconCircle } from "@/components/Icons/STSolIconCircle";
import { RayIconCircle } from "@/components/Icons/RayIconCircle";
import { UsdtIconCircle } from "@/components/Icons/UsdtIconCircle";
import { OrcaIconCircle } from "@/components/Icons/OrcaIconCircle";
import { BonkIconCircle } from "@/components/Icons/BonkIconCircle";

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

export function asToken(tokenStr: string): Token {
  switch (tokenStr) {
    case "SOL":
      return Token.SOL;
    case "mSOL":
      return Token.mSOL;
    case "stSOL":
      return Token.stSOL;
    case "USDC":
      return Token.USDC;
    case "USDT":
      return Token.USDT;
    case "RAY":
      return Token.RAY;
    case "ORCA":
      return Token.ORCA;
    case "Bonk":
      return Token.Bonk;
    default:
      throw new Error("Not a valid token string");
  }
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

export function getTokenId(token: Token) {
  switch (token) {
    case Token.SOL:
      return "solana";
    case Token.mSOL:
      return "msol";
    case Token.stSOL:
      return "lido-staked-sol";
    case Token.USDC:
      return "usd-coin";
    case Token.USDT:
      return "tether";
    case Token.RAY:
      return "raydium";
    case Token.ORCA:
      return "orca";
    case Token.Bonk:
      return "bonk";
  }
}

export function tokenAddressToToken(address: string) {
  switch (address) {
    case "So11111111111111111111111111111111111111112":
      return Token.SOL;
    case "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":
      return Token.USDC;
    default:
      return null;
  }
}
