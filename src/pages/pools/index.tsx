import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import { TableHeader } from "@/components/Molecules/PoolHeaders/TableHeader";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { useUserData } from "@/hooks/useUserData";
import { formatNumberCommas } from "@/utils/formatters";
import { useGlobalStore } from "@/stores/store";
import { getLiquidityBalance, getLiquidityShare } from "@/utils/retrieveData";
import { LoadingSpinner } from "@/components/Icons/LoadingSpinner";
import { NoPositions } from "@/components/Positions/NoPositions";

export default function Pools() {
  const poolData = useGlobalStore((state) => state.poolData);
  const { userLpTokens } = useUserData();
  const stats = useDailyPriceStats();

  const router = useRouter();
  if (!poolData) {
    return <p className="text-white">Loading...</p>;
  }

  if (Object.keys(stats).length === 0) {
    return <LoadingSpinner className="text-4xl" />;
  }

  return (
    <div className="px-16 py-6">
      <div className="flex items-baseline space-x-3 pb-8 ">
        <h1 className="m-0 text-4xl text-white">Liquidity Pools</h1>
        <div className="flex flex-row space-x-2 text-sm">
          <p className="text-zinc-500 ">TVL</p>
          <p className="text-white">
            $
            {formatNumberCommas(
              Object.values(poolData).reduce((acc, pool) => {
                return acc + Number(pool.getLiquidities(stats));
              }, 0)
            )}
          </p>
        </div>
      </div>

      {Object.values(poolData).length === 0 ? (
        <NoPositions emptyString="No Open Pools" />
      ) : (
        <table className={twMerge("table-auto", "text-white", "w-full")}>
          <thead
            className={twMerge(
              "text-xs",
              "text-zinc-500",
              "border-b",
              "border-zinc-700",
              "pb-2"
            )}
          >
            <tr className="">
              <td className="py-3">Pool name</td>
              <td>Liquidity</td>
              <td>Volume</td>
              <td>Fees</td>
              <td>OI Long</td>
              <td>OI Short</td>
              <td>Your Liquidity</td>
              <td>Your Share</td>
            </tr>
          </thead>
          <tbody>
            {Object.entries(poolData)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([poolName, pool]) => (
                <tr
                  className="cursor-pointer border-b border-zinc-700 text-xs hover:bg-zinc-800"
                  key={poolName}
                  onClick={() => router.push(`/pools/${poolName}`)}
                >
                  <td className="py-4 px-2">
                    <TableHeader
                      pool={pool}
                      iconClassName="w-6 h-6"
                      poolClassName="text-xs"
                    />
                  </td>
                  <td>${formatNumberCommas(pool.getLiquidities(stats!))}</td>
                  <td>${formatNumberCommas(pool.getTradeVolumes())}</td>
                  <td>${formatNumberCommas(pool.getFees())}</td>
                  <td>${formatNumberCommas(pool.getOiLong())}</td>
                  <td>${formatNumberCommas(pool.getOiShort())}</td>
                  {getLiquidityBalance(pool, userLpTokens, stats) > 0 ? (
                    <td>
                      $
                      {formatNumberCommas(
                        getLiquidityBalance(pool, userLpTokens, stats)
                      )}
                    </td>
                  ) : (
                    <td>-</td>
                  )}
                  {getLiquidityShare(pool, userLpTokens) > 0 ? (
                    <td>
                      {formatNumberCommas(
                        getLiquidityShare(pool, userLpTokens)
                      )}
                      %
                    </td>
                  ) : (
                    <td>-</td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
