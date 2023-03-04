import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Pool, PoolObj } from "@/lib/Pool";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { useUserData } from "@/hooks/useUserData";
import { formatNumberCommas } from "@/utils/formatters";

interface Props {
  pool: Pool;
  className?: string;
}

export default function PoolStats(props: Props) {
  const stats = useDailyPriceStats();

  const { wallet, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const { userLpTokens } = useUserData();

  function getLiquidityBalance(pool: PoolObj): number {
    let userLpBalance = userLpTokens[pool.poolAddress.toString()];
    let lpSupply = pool.lpSupply / 10 ** pool.lpDecimals;

    let userLiquidity = (userLpBalance / lpSupply) * pool.getLiquidities(stats);

    if (Number.isNaN(userLiquidity)) {
      return 0;
    }

    return userLiquidity;
  }

  function getLiquidityShare(pool: PoolObj): number {
    let userLpBalance = userLpTokens[pool.poolAddress.toString()];
    let lpSupply = pool.lpSupply / 10 ** pool.lpDecimals;

    let userShare = (userLpBalance / lpSupply) * 100;

    if (Number.isNaN(userShare)) {
      return 0;
    }
    return userShare;
  }

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
            value: `$${formatNumberCommas(getLiquidityBalance(props.pool))}`,
          },
          {
            label: "Your Share",
            value: `${formatNumberCommas(getLiquidityShare(props.pool))}%`,
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
