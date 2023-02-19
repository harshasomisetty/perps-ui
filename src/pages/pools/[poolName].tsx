import PoolBackButton from "@/components/Atoms/PoolBackButton";
import { PoolLayout } from "@/components/Layouts/PoolLayout";
import { TitleHeader } from "@/components/Molecules/PoolHeaders/TitleHeader";
import LiquidityCard from "@/components/PoolModal/LiquidityCard";
import PoolStats from "@/components/PoolModal/PoolStats";
import SinglePoolTokens from "@/components/PoolModal/SinglePoolTokens";
import { usePools } from "@/hooks/usePools";
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

  let pool = pools[router.query.poolName as string];
  return (
    <PoolLayout className="text-white">
      <div>
        <PoolBackButton className="mb-6" />
        <TitleHeader pool={pool!} iconClassName="w-10 h-10" className="mb-8" />
      </div>
      <div className="flex w-full flex-col">
        <PoolStats pool={pool!} className="mb-4" />
        <SinglePoolTokens pool={pool!} />
      </div>
      <LiquidityCard pool={pool!} />
    </PoolLayout>
  );
}
