import PoolBackButton from "@/components/Atoms/PoolBackButton";
import { LoadingSpinner } from "@/components/Icons/LoadingSpinner";
import { PoolLayout } from "@/components/Layouts/PoolLayout";
import { TitleHeader } from "@/components/Molecules/PoolHeaders/TitleHeader";
import LiquidityCard from "@/components/PoolModal/LiquidityCard";
import PoolStats from "@/components/PoolModal/PoolStats";
import SinglePoolTokens from "@/components/PoolModal/SinglePoolTokens";
import { useGlobalStore } from "@/stores/store";
import { useRouter } from "next/router";

export default function SinglePool() {
  const router = useRouter();

  const poolData = useGlobalStore((state) => state.poolData);
  let pool = poolData[router.query.poolName as string];

  if (!pool) {
    return <LoadingSpinner className="text-4xl" />;
  } else {
    return (
      <PoolLayout className="text-white">
        <div>
          <PoolBackButton className="mb-6" />
          <TitleHeader
            pool={pool!}
            iconClassName="w-10 h-10"
            className="mb-8"
          />
        </div>
        <div className="flex w-full flex-col">
          <PoolStats pool={pool!} className="mb-8" />
          <SinglePoolTokens pool={pool!} />
        </div>
        <LiquidityCard pool={pool} />
      </PoolLayout>
    );
  }
}
