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

  return (
    <div className="bg-zinc-900 p-4">
      <div className="flex flex-row">
        <PoolTokens tokens={props.pool.tokenNames} />
        <div>
          <p className="font-medium">{props.pool.poolName}</p>
          <div className="flex flex-row text-xs font-medium text-zinc-500 ">
            <p>{tokenAddressToToken(Object.keys(props.pool.tokens)[0])}</p>

            {Object.keys(props.pool.tokens)
              .slice(1)
              .map((tokenMint) => (
                <p>, {tokenAddressToToken(tokenMint)}</p>
              ))}
          </div>
        </div>
      </div>
      <table className={twMerge("table-auto", "text-white", "border-t", "p-4")}>
        <thead
          className={twMerge(
            "text-xs",
            "text-zinc-500",
            "border-b",
            "border-zinc-700",
            "flex",
            "items-center"
          )}
        >
          <tr>
            <td>Pool Tokens</td>
            <td>Deposit Fee</td>
            <td>Liquidity</td>
            <td>Price</td>
            <td>Amount</td>
            <td>Current/Target Weight</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(props.pool.tokens).map(([tokenMint, custody]) => {
            const token = tokenAddressToToken(tokenMint);
            const icon = getTokenIcon(token);
            return (
              <tr key={tokenMint}>
                <td>
                  <div className="flex flex-row">
                    {cloneElement(icon, {
                      className: "h-10 w-10",
                    })}
                    <div className="flex flex-col">
                      <p>{tokenAddressToToken(tokenMint)}</p>
                      <p className={twMerge("text-xs", "text-zinc-500")}>
                        {getTokenLabel(token)}
                      </p>
                    </div>
                  </div>
                </td>
                <td>{Number(custody.amount) / 10 ** custody.decimals}</td>
                <td>{stats[token].currentPrice}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
