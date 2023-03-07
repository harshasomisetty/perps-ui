import PoolBackButton from "@/components/Atoms/PoolBackButton";
import { PoolLayout } from "@/components/Layouts/PoolLayout";
import { TitleHeader } from "@/components/Molecules/PoolHeaders/TitleHeader";
import LiquidityCard from "@/components/PoolModal/LiquidityCard";
import PoolStats from "@/components/PoolModal/PoolStats";
import SinglePoolTokens from "@/components/PoolModal/SinglePoolTokens";
import { useGlobalStore } from "@/stores/store";
import { useRouter } from "next/router";

interface Props {}

export default function SinglePool(props: Props) {
  const router = useRouter();

  const poolData = useGlobalStore((state) => state.poolData);
  let pool = poolData[router.query.poolName as string];

  if (!pool) {
    return <p className="text-white">Loading...</p>;
  }

  // console.log("formatting num", Nupool.getTradeVolumes().toLocaleString());
  return (
    <PoolLayout className="text-white">
      <div>
        <PoolBackButton className="mb-6" />
        <TitleHeader pool={pool!} iconClassName="w-10 h-10" className="mb-8" />
      </div>
      <div className="flex w-full flex-col">
        <PoolStats pool={pool!} className="mb-8" />
        <SinglePoolTokens pool={pool!} />
      </div>
      <LiquidityCard pool={pool!} />
    </PoolLayout>
  );
}
