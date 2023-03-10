import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { getTokenIcon, getTokenLabel, tokenAddressToToken } from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import { ACCOUNT_URL } from "@/lib/TransactionHandlers";
import NewTab from "@carbon/icons-react/lib/NewTab";
import { formatNumberCommas } from "@/utils/formatters";
import { PoolAccount } from "@/lib/PoolAccount";
import { useGlobalStore } from "@/stores/store";
import { LoadingSpinner } from "../Icons/LoadingSpinner";

interface Props {
  className?: string;
  pool: PoolAccount;
}

export default function SinglePoolTokens(props: Props) {
  const stats = useDailyPriceStats();
  let poolData = useGlobalStore((state) => state.poolData);

  if (Object.keys(stats).length === 0) {
    return <LoadingSpinner className="absolute text-4xl" />;
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
              {Object.values(props.pool.custodies).map((custody) => {
                let pool = poolData[custody.pool.toString()];
                let token = custody.getTokenE();

                if (!token) return <></>;

                return (
                  <tr
                    key={custody.mint.toString()}
                    className="border-t border-zinc-700"
                  >
                    <td className="py-4">
                      <div className="flex flex-row items-center space-x-1">
                        {cloneElement(getTokenIcon(custody.getTokenE()!), {
                          className: "h-10 w-10",
                        })}
                        <div className="flex flex-col">
                          <p className="font-medium">{custody.getTokenE()!}</p>
                          <p className={twMerge("text-xs", "text-zinc-500")}>
                            {getTokenLabel(custody.getTokenE()!)}
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
                    <td>{Number(custody.fees.addLiquidity) / 100}%</td>
                    <td>
                      $
                      {formatNumberCommas(
                        stats[token].currentPrice *
                          ((Number(custody.assets.owned) -
                            Number(custody.assets.locked)) /
                            10 ** custody.decimals)
                      )}
                    </td>
                    <td>${formatNumberCommas(stats[token].currentPrice)}</td>
                    <td>
                      {formatNumberCommas(
                        Number(custody.assets.owned) / 10 ** custody.decimals
                      )}
                    </td>
                    <td>
                      {formatNumberCommas(
                        (100 *
                          stats[token].currentPrice *
                          (Number(custody.assets.owned) /
                            10 ** custody.decimals)) /
                          props.pool.getLiquidities(stats)!
                      )}
                      % /{" "}
                      {Number(
                        pool?.getCustodyStruct(custody.address)!.targetRatio
                      ) / 100}
                      %
                    </td>
                    <td>
                      {formatNumberCommas(
                        100 *
                          (Number(custody.assets.locked) /
                            Number(custody.assets.owned))
                      )}
                      %
                    </td>
                    <td>
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${ACCOUNT_URL(custody.address.toString())}`}
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
