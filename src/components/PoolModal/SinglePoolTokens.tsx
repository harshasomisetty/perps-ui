import { Pool } from "@/lib/Pool";
import { getTokenIcon, getTokenLabel, tokenAddressToToken } from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import { PoolTokens } from "../PoolTokens";

interface Props {
  className?: string;
  //   tokens: Token[];
  pool: Pool;
}

export default function SinglePoolTokens(props: Props) {
  console.log("all tokens");

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
                      <p className={twMerge("text-xs", "text-zinc-500")}>
                        {getTokenLabel(tokenAddressToToken(tokenMint))}
                      </p>
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
