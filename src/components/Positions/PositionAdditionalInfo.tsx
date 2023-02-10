import { usePools } from "@/hooks/usePools";
import { Pool } from "@/lib/Pool";
import { Position } from "@/lib/Position";
import CloseIcon from "@carbon/icons-react/lib/Close";
import EditIcon from "@carbon/icons-react/lib/Edit";
import { BN } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { format } from "date-fns";
import { useState } from "react";
import { closePosition } from "src/actions/closePosition";
import { twMerge } from "tailwind-merge";
import { PositionValueDelta } from "./PositionValueDelta";
import { SolidButton } from "../SolidButton";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";

function formatPrice(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  position: Position;
}

export function PositionAdditionalInfo(props: Props) {
  const { publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();
  const allPriceStats = useDailyPriceStats();

  const { pools } = usePools();
  const [pool, setPool] = useState<Pool | null>(null);
  

  let payToken = props.position.token;
  let positionToken = props.position.token;

  // TODO: select correct pool and also refetch usePositions after the transaction 
  async function handleCloseTrade() {
    console.log("in close trade");
    await closePosition(
      pool,
      wallet,
      publicKey,
      signTransaction,
      connection,
      payToken,
      positionToken,
      props.position.positionAccountAddress,
      props.position.type,
      new BN(allPriceStats[payToken]?.currentPrice * 10**6)
    );
  }

  // router.reload(window.location.pathname);
  if (pools === undefined) {
    return <p>single Pool not loaded</p>;
  } else if (pool === null) {
    //  FIXED : fetch pool from position 
    const pool1 = Object.values(pools).filter(i => i.poolAddress.toBase58() == props.position.poolAddress);
    if(pool1.length){
      setPool(pool1[0]);
      return <p>multiple Pools not loaded</p>;
    } else {
      return <p>single Pool not loaded</p>;
    }
    
  } else {
    return (
      <div
        className={twMerge(
          "overflow-hidden",
          "grid",
          "grid-cols-[12%,1fr,max-content]",
          "gap-x-8",
          "items-center",
          "pr-4",
          props.className
        )}
      >
        <div />
        <div
          className={twMerge(
            "bg-zinc-900",
            "gap-x-8",
            "grid-cols-[max-content,1fr,1fr,1fr]",
            "grid",
            "h-20",
            "items-center",
            "px-3",
            "rounded",
            "w-full"
          )}
        >
          <div>
            <div className="text-xs text-zinc-500">Time</div>
            <div className="mt-1 text-sm text-white">
              {format(props.position.timestamp, "d MMM yyyy • p")}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">PnL</div>
            <PositionValueDelta
              className="mt-0.5"
              valueDelta={props.position.pnlDelta}
              valueDeltaPercentage={props.position.pnlDeltaPercent}
              formatValueDelta={formatPrice}
            />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Size</div>
            <div className="mt-1 flex items-center">
              <div className="text-sm text-white">
                ${formatPrice(props.position.size)}
              </div>
              <button className="group ml-2">
                <EditIcon
                  className={twMerge(
                    "fill-zinc-500",
                    "h-4",
                    "transition-colors",
                    "w-4",
                    "group-hover:fill-white"
                  )}
                />
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Liq. Threshold</div>
            <div className="mt-1 text-sm text-white">
              ${formatPrice(props.position.liquidationThreshold)}
            </div>
          </div>
        </div>
        <SolidButton className="h-9 w-36" onClick={handleCloseTrade}>
          <CloseIcon className="mr-2 h-4 w-4" />
          <div>Close Position</div>
        </SolidButton>
      </div>
    );
  }
}
