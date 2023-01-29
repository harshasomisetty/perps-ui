import { Pool } from "@/hooks/usePools";
import { getTokenIcon, getTokenLabel, tokenAddressToToken } from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  //   tokens: Token[];
  pool: Pool;
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
          {Object.entries(props.pool.tokens).map(([tokenMint, custody]) => {
            const icon = getTokenIcon(tokenAddressToToken(tokenMint));
            return (
              <tr key={tokenMint}>
                <td>
                  <div className="flex flex-row">
                    {cloneElement(icon, {
                      className: "h-10 w-10",
                    })}
                    <div className="flex flex-col">
                      <p>{tokenAddressToToken(tokenMint)}</p>
                      <p>{getTokenLabel(tokenAddressToToken(tokenMint))}</p>
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

// <>
//   {custodies[pool.publicKey.toString()] &&
//     custodies[pool.publicKey.toString()].map(function (custody) {
//       let token = tokenAddressToToken(custody.mint.toString());

//       return (
//         <tr>
//           <td>{pool.account.name}</td>
//           <td>{pool.publicKey.toString()}</td>
//           <td>{token}</td>
//           <td>
//             {stats[token].currentPrice *
//               Number(custody.assets.owned)}
//           </td>
//           <td>{stats[token].currentPrice}</td>
//           <td>{Number(custody.assets.owned)}</td>
//           <td>Target Weight</td>
//           <td>Utilization</td>
//           <td>Fee</td>
//         </tr>
//       );
//     })}
// </>
