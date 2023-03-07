import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { useUserData } from "@/hooks/useUserData";
import { formatNumberCommas } from "@/utils/formatters";
import { PoolAccount } from "@/lib/PoolAccount";
import { Pool } from "src/types";
import { getLiquidityBalance, getLiquidityShare } from "@/utils/getters";

interface Props {
  pool: Pool;
  className?: string;
}

export default function PoolStats(props: Props) {
  const stats = useDailyPriceStats();

  const { userLpTokens } = useUserData();

  if (Object.keys(stats).length === 0) {
    return <>Loading stats</>;
  } else {
    return (
      <div
        className={twMerge(
          "grid",
          "grid-cols-4",
          "gap-x-4",
          "gap-y-8",
          props.className
        )}
      >
        {[
          {
            label: "Liquidity",
            value: `$${formatNumberCommas(props.pool.getLiquidities(stats))}`,
          },
          {
            label: "Volume",
            value: `$${formatNumberCommas(props.pool.getTradeVolumes())}`,
          },
          {
            label: "OI Long",
            value: (
              <>
                {`$${formatNumberCommas(props.pool.getOiLong())} `}
                <span className="text-zinc-500"> </span>
              </>
            ),
          },
          {
            label: "OI Short",
            value: `$${formatNumberCommas(props.pool.getOiShort())}`,
          },
          {
            label: "Fees",
            value: `$${formatNumberCommas(props.pool.getFees())}`,
          },
          {
            label: "Your Liquidity",
            value: `$${formatNumberCommas(
              getLiquidityBalance(props.pool, userLpTokens, stats)
            )}`,
          },
          {
            label: "Your Share",
            value: `${formatNumberCommas(
              Number(getLiquidityShare(props.pool, userLpTokens))
            )}%`,
          },
        ].map(({ label, value }, i) => (
          <div
            className={twMerge("border-zinc-700", "border-t", "pt-3")}
            key={i}
          >
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="text-sm text-white">{value}</div>
          </div>
        ))}
      </div>
    );
  }
}
