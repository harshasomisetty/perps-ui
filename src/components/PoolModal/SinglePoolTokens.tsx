import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import {
  getTokenIcon,
  getTokenLabel,
  tokenAddressToToken,
} from "src/types/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import { ACCOUNT_URL } from "@/lib/TransactionHandlers";
import NewTab from "@carbon/icons-react/lib/NewTab";
import { formatNumberCommas } from "@/utils/formatters";
import { Pool } from "src/types";

interface Props {
  className?: string;
  pool: Pool;
}

function TableHeader() {
  return (
    <>
      <p>Pool Tokens</p>
      <p>Deposit Fee</p>
      <p>Liquidity</p>
      <p>Price</p>
      <p>Amount</p>
      <p>Current/Target Weight</p>
      <p>Utilization</p>
      <p>Utilization</p>
    </>
  );
}

export default function SinglePoolTokens(props: Props) {
  const stats = useDailyPriceStats();

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  } else {
    return (
      <div className="w-full ">
        <div className="bg-zinc-900 p-8">
          <table className={twMerge("table-auto", "text-white", "w-full")}>
            <thead className={twMerge("text-xs", "text-zinc-500", "p-10")}>
              <tr className="">
                <td className="pb-5 text-white">Pool Tokens</td>
                <td className="pb-5">Deposit Fee</td>
                <td className="pb-5">Liquidity</td>
                <td className="pb-5">Price</td>
                <td className="pb-5">Amount</td>
                <td className="pb-5">Current/Target Weight</td>
                <td className="pb-5">Utilization</td>
                <td className="pb-5"></td>
              </tr>
            </thead>
            <tbody className={twMerge("text-xs")}>
              {Object.entries(props.pool.tokens).map(([tokenMint, custody]) => {
                const token = tokenAddressToToken(tokenMint);
                const icon = getTokenIcon(token);
                return (
                  <tr key={tokenMint} className="border-t border-zinc-700">
                    <td className="py-4">
                      <div className="flex flex-row items-center space-x-1">
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
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={`${ACCOUNT_URL(custody.mint.toString())}`}
                        >
                          <NewTab />
                        </a>
                      </div>
                    </td>
                    <td>{custody.fees.addLiquidity / 100}%</td>
                    <td>
                      $
                      {formatNumberCommas(
                        stats[token].currentPrice *
                          (Number(custody.owned) / 10 ** custody.decimals)
                      )}
                    </td>
                    <td>${formatNumberCommas(stats[token].currentPrice)}</td>
                    <td>
                      {formatNumberCommas(
                        Number(custody.owned) / 10 ** custody.decimals
                      )}
                    </td>
                    <td>
                      {formatNumberCommas(
                        (100 *
                          stats[token].currentPrice *
                          (Number(custody.owned) / 10 ** custody.decimals)) /
                          props.pool.getLiquidities(stats)
                      )}
                      % / {custody.targetRatio}%
                    </td>
                    <td>
                      {formatNumberCommas(
                        100 * (Number(custody.locked) / Number(custody.owned))
                      )}
                      %
                    </td>
                    <td>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${ACCOUNT_URL(
                          custody.custodyAccount.toString()
                        )}`}
                      >
                        <NewTab />
                      </a>
                    </td>
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
