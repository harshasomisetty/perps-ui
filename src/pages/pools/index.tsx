import { useEffect, useState } from "react";
import { usePools } from "@/hooks/usePools";
import { twMerge } from "tailwind-merge";
import { Pool } from "@/lib/Pool";
import { useRouter } from "next/router";
import { TableHeader } from "@/components/Molecules/PoolHeaders/TableHeader";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Pools() {
  const { pools } = usePools();
  const router = useRouter();
  const stats = useDailyPriceStats();
  const { wallet, publicKey, signTransaction } = useWallet();

  const [selectedPool, setSelectedPool] = useState<null | Pool>(null);

  if (!pools) {
    return <p className="text-white">Loading...</p>;
  }

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  }

  console.log("pools in ppol page", pools);
  // TODO align title by baseline

  // useEffect(() => {
  //   async function fetchData() {
  //     let lpTokenAccount = await getAssociatedTokenAddress(
  //       props.pool.lpTokenMint,
  //       publicKey
  //     );

  //     let balance = 0;
  //     if (await checkIfAccountExists(lpTokenAccount, connection)) {
  //       balance = (await connection.getTokenAccountBalance(lpTokenAccount))
  //         .value.uiAmount;
  //     }
  //     console.log("user balance: ", balance);
  //   }
  //   if (publicKey) {
  //     fetchData();
  //   }
  // }, [wallet, publicKey]);

  return (
    <div className="px-16 py-6">
      <div className="flex items-baseline space-x-3 pb-8 ">
        <h1 className="m-0 text-4xl text-white">Liquidity Pools</h1>
        <div className="flex flex-row space-x-2 text-sm">
          <p className="text-zinc-500 ">TVL</p>
          <p className="text-white">
            $
            {Object.values(pools)
              .reduce((acc, pool) => {
                return acc + Number(pool.getLiquidities(stats));
              }, 0)
              .toFixed(2)}
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
          {Object.entries(pools).map(([poolName, pool]) => (
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
              <td>${pool.getLiquidities(stats)}</td>
              <td>${pool.getTradeVolumes()}</td>
              <td>${pool.getFees()}</td>
              <td>${pool.getOiLong()}</td>
              <td>${pool.getOiShort()}</td>
              <td>${}</td>
              <td>{}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
