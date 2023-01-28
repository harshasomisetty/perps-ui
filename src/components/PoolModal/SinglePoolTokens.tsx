import { Pool } from "@/hooks/usePools";
import { getTokenIcon, getTokenLabel, tokenAddressToToken } from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  //   tokens: Token[];
  pool: Pool | null;
}

export default function SinglePoolTokens(props: Props) {
  return (
    <div>
      <p>{props.pool.poolName}</p>
      <table className={twMerge("table-auto", "text-white")}>
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
          {props.pool.tokens.map((token, ind) => {
            console.log("token ma", token);
            const icon = getTokenIcon(tokenAddressToToken(token.mint));
            return (
              <tr key={ind}>
                <td>
                  <div className="flex flex-row">
                    {cloneElement(icon, {
                      className: "h-10 w-10",
                    })}
                    <div className="flex flex-col">
                      <p>{tokenAddressToToken(token.mint)}</p>
                      <p>{getTokenLabel(tokenAddressToToken(token.mint))}</p>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
