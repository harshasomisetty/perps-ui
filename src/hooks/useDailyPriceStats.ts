import { useEffect, useRef, useState } from "react";

import { getTokenId, Token } from "@/lib/Token";

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
        console.log("caught data fetching error");
        let data = firstData;
        const allStats = TOKEN_LIST.reduce((acc, token) => {
          console.log("fetching data all stats");
          console.log("token", token);
          console.log("data", data);
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
