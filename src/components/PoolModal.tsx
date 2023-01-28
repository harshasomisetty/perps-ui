import { Pool } from "@/hooks/usePools";
import { getTokenIcon, tokenAddressToToken } from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  pool: Pool | null;
  setPool: (pool: Pool | null) => void;
}

export default function PoolModal(props: Props) {
  console.log("pool in pool modal", props.pool.tokens);

  if (props.pool === null) {
    <></>;
  }

  return (
    <div className="absolute h-screen w-screen border border-white bg-black p-4 text-white">
      <div className="flex flex-row">
        <p>Add Liquidity</p>
        <div className="cursor-pointer" onClick={() => props.setPool(null)}>
          X
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>insert liq card</div>
        <div>
          <p>modal Pool: {props.pool.poolName}</p>
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
              {props.pool.tokens.map((token) => {
                console.log("token ma", token);
                const icon = getTokenIcon(tokenAddressToToken(token.mint));
                return (
                  <tr>
                    <td>
                      {cloneElement(icon, {
                        className: "h-10 w-10",
                      })}
                    </td>
                    {/* <td>{icon}</td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
