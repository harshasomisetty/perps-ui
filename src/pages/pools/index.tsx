import { useState } from "react";
import { usePools } from "@/hooks/usePools";
import { twMerge } from "tailwind-merge";
import PoolModal from "@/components/PoolModal";
import { Pool } from "@/lib/Pool";
import { useRouter } from "next/router";
import { TableHeader } from "@/components/Molecules/PoolHeaders/TableHeader";

export default function Pools() {
  const { pools } = usePools();
  const router = useRouter();

  const [selectedPool, setSelectedPool] = useState<null | Pool>(null);

  if (!pools) {
    return <p className="text-white">Loading...</p>;
  }

  console.log("pools in ppol page", pools);
  // TODO align title by baseline
  return (
    <div className="px-16 py-6">
      <div className="flex items-end space-x-3 pb-8">
        <h1 className="text-4xl text-white">Liquidity Pools</h1>
        <div className="flex flex-row space-x-2 text-sm">
          <p className="text-zinc-500">TVL</p>
          <p className="text-white">${0}</p>
        </div>
      </div>

      {selectedPool && (
        <PoolModal pool={selectedPool} setPool={setSelectedPool} />
      )}
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
              <td>${1234456}</td>
              <td>${1234456}</td>
              <td>${1234}</td>
              <td>${12.34}</td>
              <td>${12.34}</td>
              <td>${1234}</td>
              <td>{0.012}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
