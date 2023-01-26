import { useEffect, useRef, useState } from "react";

import { Token } from "@/lib/Token";

export const TOKEN_LIST = [
  Token.SOL,
  Token.mSOL,
  Token.stSOL,
  Token.USDC,
  Token.USDT,
  Token.RAY,
  Token.ORCA,
  Token.Bonk,
];

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

export function asToken(token: string) {
  switch (token) {
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
      throw new Error("not a valid token");
  }
}

function getTokenId(token: Token) {
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

interface Stats {
  change24hr: number;
  currentPrice: number;
  high24hr: number;
  low24hr: number;
}

type AllStats = Record<Token, Stats>;

const fetchAllStats = (() => {
  let inFlight: null | Promise<AllStats> = null;

  // TODO fix this firstData fetching hack when going to trading view

  let firstData;

  return () => {
    if (inFlight) {
      return inFlight;
    }

    inFlight = fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${TOKEN_LIST.map(
        getTokenId
      ).join(
        ","
      )}&vs_currencies=USD&include_24hr_vol=true&include_24hr_change=true`
    )
      .then((resp) => resp.json())
      .then((data) => {
        if (!firstData) {
          firstData = data;
        }
        const allStats = TOKEN_LIST.reduce((acc, token) => {
          const tokenData = data[getTokenId(token)];

          acc[token] = {
            change24hr: tokenData.usd_24h_change,
            currentPrice: tokenData.usd,
            high24hr: 0,
            low24hr: 0,
          };

          return acc;
        }, {} as AllStats);

        inFlight = null;

        return allStats;
      })
      .catch(() => {
        console.log("caught fetching error");
        let data = firstData;
        const allStats = TOKEN_LIST.reduce((acc, token) => {
          const tokenData = data[getTokenId(token)];

          acc[token] = {
            change24hr: tokenData.usd_24h_change,
            currentPrice: tokenData.usd,
            high24hr: 0,
            low24hr: 0,
          };

          return acc;
        }, {} as AllStats);

        inFlight = null;

        return allStats;
      });

    return inFlight;
  };
})();

export function useDailyPriceStats(): AllStats;
export function useDailyPriceStats(token: Token): Stats;
export function useDailyPriceStats(token?: Token) {
  const timer = useRef<number | null>(null);

  const [allStats, setAllStats] = useState<Partial<AllStats>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchAllStats().then(setAllStats);

      timer.current = window.setInterval(async () => {
        fetchAllStats().then(setAllStats);
      }, 10000);
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [token]);

  if (token) {
    return (
      allStats[token] || {
        change24hr: 0,
        currentPrice: 0,
        high24hr: 0,
        low24hr: 0,
      }
    );
  }

  return allStats;
}
