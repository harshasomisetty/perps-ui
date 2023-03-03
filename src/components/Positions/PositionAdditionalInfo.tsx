import { usePools } from "@/hooks/usePools";
import { Pool } from "@/lib/Pool";
import { Position } from "@/lib/Position";
import CloseIcon from "@carbon/icons-react/lib/Close";
import EditIcon from "@carbon/icons-react/lib/Edit";
import { BN } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { closePosition } from "src/actions/closePosition";
import { twMerge } from "tailwind-merge";
import { PositionValueDelta } from "./PositionValueDelta";
import { SolidButton } from "../SolidButton";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { useRouter } from "next/router";
import { usePositions } from "@/hooks/usePositions";
import { getPnl } from "src/actions/getPrices";
import { getTokenAddress } from "@/lib/Token";

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

  let payToken = props.position.token;
  let positionToken = props.position.token;
  const { fetchPositions } = usePositions();

  const [pnl, setPnl] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let token = props.position.token;

      let custody =
        pools[props.position.poolName].tokens[getTokenAddress(token)];

      let fetchedPrice = await getPnl(
        wallet,
        publicKey,
        connection,
        props.position.poolAddress,
        props.position.positionAccountAddress,
        custody.custodyAccount,
        custody.oracleAccount
      );
      setPnl(fetchedPrice);

      console.log("pnl percentage", pnl, props.position.collateralUsd);
    }
    if (pools) {
      fetchData();
    }
  }, [pools]);

  async function handleCloseTrade() {
    console.log("in close trade");
    let pool = pools[props.position.poolAddress.toString()];
    await closePosition(
      pool,
      wallet,
      publicKey,
      signTransaction,
      connection,
      payToken,
      positionToken,
      props.position.positionAccountAddress,
      props.position.side,
      new BN(allPriceStats[payToken]?.currentPrice * 10 ** 6)
    );

    fetchPositions();
  }

  return (
    <div
      className={twMerge(
        "overflow-hidden",
        "grid",
        "grid-cols-[12%,1fr,1fr,max-content]",
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
            valueDelta={pnl}
            valueDeltaPercentage={pnl / props.position.collateralUsd}
            formatValueDelta={formatPrice}
          />
        </div>
        <div>
          <div className="text-xs text-zinc-500">Size</div>
          <div className="mt-1 flex items-center">
            <div className="text-sm text-white">
              ${formatPrice(props.position.sizeUsd)}
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
