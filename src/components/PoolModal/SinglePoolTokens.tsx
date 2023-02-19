import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Pool } from "@/lib/Pool";
import {
  getTokenIcon,
  getTokenLabel,
  Token,
  tokenAddressToToken,
} from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import { PoolTokens } from "../PoolTokens";

interface Props {
  className?: string;
  //   tokens: Token[];
  pool: Pool;
}

export default function SinglePoolTokens(props: Props) {
  const stats = useDailyPriceStats();

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  } else {
    return (
      <div className="w-full border">
        <div className="bg-zinc-900 p-8">
          <table className={twMerge("table-auto", "text-white", "w-full")}>
            <thead className={twMerge("text-xs", "text-zinc-500", "p-10")}>
              <tr className="m-10 p-10">
                <td>Pool Tokens</td>
                <td>Deposit Fee</td>
                <td>Liquidity</td>
                <td>Price</td>
                <td>Amount</td>
                <td>Current/Target Weight</td>
                <td>Utilization</td>
              </tr>
            </thead>
            <tbody className={twMerge("text-xs")}>
              {Object.entries(props.pool.tokens).map(([tokenMint, custody]) => {
                const token = tokenAddressToToken(tokenMint);
                const icon = getTokenIcon(token);
                return (
                  <tr key={tokenMint} className="my-2 border-t border-zinc-700">
                    <td>
                      <div className="flex flex-row space-x-1">
                        {cloneElement(icon, {
                          className: "h-10 w-10",
                        })}
                        <div className="flex flex-col">
                          <p className="font-medium">
                            {tokenAddressToToken(tokenMint)}
                          </p>
                          <p className={twMerge("text-xs", "text-zinc-500")}>
                            {getTokenLabel(token)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>%</td>
                    <td>
                      {(
                        stats[token].currentPrice *
                        (Number(custody.amount) / 10 ** custody.decimals)
                      ).toFixed(2)}
                    </td>
                    <td>{stats[token].currentPrice.toFixed(2)}</td>
                    <td>
                      {(
                        Number(custody.amount) /
                        10 ** custody.decimals
                      ).toFixed(2)}
                    </td>
                    <td>% / %</td>
                    <td>%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
