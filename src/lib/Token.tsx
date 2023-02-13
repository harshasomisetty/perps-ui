import { SolanaIconCircle } from "@/components/Icons/SolanaIconCircle";
import { UsdcIconCircle } from "@/components/Icons/UsdcIconCircle";
import { MSolIconCircle } from "@/components/Icons/MSolIconCircle";
import { STSolIconCircle } from "@/components/Icons/STSolIconCircle";
import { RayIconCircle } from "@/components/Icons/RayIconCircle";
import { UsdtIconCircle } from "@/components/Icons/UsdtIconCircle";
import { OrcaIconCircle } from "@/components/Icons/OrcaIconCircle";
import { BonkIconCircle } from "@/components/Icons/BonkIconCircle";
import { Pool } from "@/hooks/usePools";

export enum Token {
  SOL = "SOL",
  mSOL = "mSOL",
  stSOL = "stSOL",
  USDC = "USDC",
  USDT = "USDT",
  RAY = "RAY",
  ORCA = "ORCA",
  Bonk = "Bonk",
  TEST = "Test",
}
export const TOKEN_LIST = [
  Token.SOL,
  Token.mSOL,
  Token.stSOL,
  Token.USDC,
  Token.USDT,
  Token.RAY,
  Token.ORCA,
  Token.Bonk,
  Token.TEST,
];

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
    case "Test":
      return Token.TEST;
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
    case Token.TEST:
      return "Test Token";
  }
}

export function getSymbol(token: Token) {
  switch (token) {
    case Token.Bonk:
      return "BONKUSDT";
    case Token.ORCA:
      return "ORCAUSD";
    case Token.RAY:
      return "RAYUSD";
    case Token.SOL:
      return "SOLUSD";
    case Token.USDC:
      return "USDCUSD";
    case Token.USDT:
      return "USDTUSD";
    case Token.mSOL:
      return "MSOLUSD";
    case Token.stSOL:
      return "STSOLUSDT";
    case Token.TEST:
      return "BARUSD";
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
    case Token.TEST:
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
    case Token.TEST:
      return "bar";
  }
}

export function tokenAddressToToken(address: string) {
  switch (address) {
    case "So11111111111111111111111111111111111111112":
      return Token.SOL;
    case "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So":
      return Token.mSOL;
    case "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj":
      return Token.stSOL;
    // case "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU":
    case "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr":
      return Token.USDC;
    case "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB":
      return Token.USDT;
    case "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R":
      return Token.RAY;
    case "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE":
      return Token.ORCA;
    case "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263":
      return Token.Bonk;
    case "6QGdQbaZEgpXqqbGwXJZXwbZ9xJnthfyYNZ92ARzTdAX":
      return Token.TEST;
    default:
      return null;
  }
}

export function getTokenAddress(token: Token) {
  switch (token) {
    case Token.SOL:
      return "So11111111111111111111111111111111111111112";
    case Token.mSOL:
      return "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So";
    case Token.stSOL:
      return "7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj";
    case Token.USDC:
      // return "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
      return "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr";
    case Token.USDT:
      return "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
    case Token.RAY:
      return "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R";
    case Token.ORCA:
      return "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE";
    case Token.Bonk:
      return "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263";
    case Token.TEST:
      return "6QGdQbaZEgpXqqbGwXJZXwbZ9xJnthfyYNZ92ARzTdAX";
  }
}
