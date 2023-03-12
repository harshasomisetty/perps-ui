import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { getMint, Mint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { getLiquidityBalance, getLiquidityShare } from "@/utils/retrieveData";
import { useUserData } from "@/hooks/useUserData";
import { formatNumberCommas } from "@/utils/formatters";
import { PoolAccount } from "@/lib/PoolAccount";
import { LoadingSpinner } from "../Icons/LoadingSpinner";

interface Props {
  pool: PoolAccount;
  className?: string;
}

export default function PoolGeneralStats(props: Props) {
  const stats = useDailyPriceStats();
  const { connection } = useConnection();

  const { userLpTokens } = useUserData();

  const [lpMint, setLpMint] = useState<Mint | null>(null);

  useEffect(() => {
    (async () => {
      const lpData = await getMint(connection, props.pool.getLpTokenMint());
      setLpMint(lpData);
    })();
    // @ts-ignore
  }, []);

  if (Object.keys(stats).length === 0 || lpMint === null) {
    return <LoadingSpinner className="absolute text-4xl" />;
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
