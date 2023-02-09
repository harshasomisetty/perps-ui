import { PoolHeader } from "@/components/PoolHeader";
import LiquidityCard from "@/components/PoolModal/LiquidityCard";
import PoolStats from "@/components/PoolModal/PoolStats";
import SinglePoolTokens from "@/components/PoolModal/SinglePoolTokens";
import { usePools } from "@/hooks/usePools";
import { Pool } from "@/lib/Pool";
import { ChevronLeft } from "@carbon/icons-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/router";

interface Props {}

export default function SinglePool(props: Props) {
  const { wallet } = useWallet();
  const { pools } = usePools();
  const router = useRouter();

  if (!pools) {
    return <p className="text-white">Loading...</p>;
  }

  let pool = Object.values(pools)[0];
  return (
    <div className="p-10 text-white">
      <div
        className="flex cursor-pointer flex-row align-bottom"
        onClick={() => router.push("/pools")}
      >
        <ChevronLeft className="h-8 w-8" />

        <p className="text-zinc-400">Back To Pools</p>
      </div>
      <div className="flex flex-col">
        <PoolHeader pool={pool} iconClassName="w-10 h-10" />
        <div className="flex flex-row justify-between">
          <div className="flex w-full flex-col">
            <PoolStats pool={pool} />
            <SinglePoolTokens pool={pool!} />
          </div>
          <LiquidityCard pool={pool!} />
        </div>
      </div>
    </div>
  );
}
