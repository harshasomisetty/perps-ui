import { twMerge } from "tailwind-merge";
import { PoolAccount } from "@/lib/PoolAccount";
import { useRouter } from "next/router";
import { TableHeader } from "@/components/Molecules/PoolHeaders/TableHeader";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { useUserData } from "@/hooks/useUserData";
import { formatNumberCommas } from "@/utils/formatters";
import { useGlobalStore } from "@/stores/store";

export default function Pools() {
  const poolData = useGlobalStore((state) => state.poolData);
  console.log("global pool data", poolData);
  const router = useRouter();
  const stats = useDailyPriceStats();
  // const { wallet, publicKey, signTransaction } = useWallet();

  // const [selectedPool, setSelectedPool] = useState<null | Pool>(null);
  const { userLpTokens } = useUserData();

  if (!poolData) {
    return <p className="text-white">Loading...</p>;
  }

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  }

  function getLiquidityBalance(pool: PoolAccount): number {
    let userLpBalance = userLpTokens[pool.poolAddress.toString()];
    let lpSupply = Number(pool.lpSupply) / 10 ** pool.lpDecimals;
    let userLiquidity = (userLpBalance / lpSupply) * pool.getLiquidities(stats);

    if (Number.isNaN(userLiquidity)) {
      return 0;
    }

    return userLiquidity;
  }

  function getLiquidityShare(pool: PoolAccount): number {
    let userLpBalance = userLpTokens[pool.poolAddress.toString()];
    let lpSupply = Number(pool.lpSupply) / 10 ** pool.lpDecimals;

    let userShare = (userLpBalance / lpSupply) * 100;

    if (Number.isNaN(userShare)) {
      return 0;
    }
    return userShare;
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
          {Object.entries(poolData).map(([poolName, pool]) => (
            <tr
              className="cursor-pointer border-b border-zinc-700 text-xs hover:bg-zinc-800"
              key={poolName}
              onClick={() => router.push(`/poolData/${poolName}`)}
            >
              <td className="py-4 px-2">
                <TableHeader
                  pool={pool}
                  iconClassName="w-6 h-6"
                  poolClassName="text-xs"
                />
              </td>
              <td>${formatNumberCommas(pool.getLiquidities(stats))}</td>
              <td>${formatNumberCommas(pool.getTradeVolumes())}</td>
              <td>${formatNumberCommas(pool.getFees())}</td>
              <td>${formatNumberCommas(pool.getOiLong())}</td>
              <td>${formatNumberCommas(pool.getOiShort())}</td>
              {getLiquidityBalance(pool) > 0 ? (
                <td>${formatNumberCommas(getLiquidityBalance(pool))}</td>
              ) : (
                <td>-</td>
              )}
              {getLiquidityShare(pool) > 0 ? (
                <td>{formatNumberCommas(getLiquidityShare(pool))}%</td>
              ) : (
                <td>-</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
