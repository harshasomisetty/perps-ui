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
import { getLiquidationPrice, getPnl } from "src/actions/getPrices";
import { useGlobalStore } from "@/stores/store";
import { Side } from "@/lib/types";
import { PositionAccount } from "@/lib/PositionAccount";
import { formatPrice } from "@/utils/formatters";

interface Props {
  className?: string;
  position: PositionAccount;
}

export function PositionAdditionalInfo(props: Props) {
  const { publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();
  const stats = useDailyPriceStats(props.position.token);

  const poolData = useGlobalStore((state) => state.poolData);
  const custodyData = useGlobalStore((state) => state.custodyData);

  const positionPool = poolData[props.position.pool.toString()]!;
  const positionCustody = custodyData[props.position.custody.toString()]!;

  let payToken = props.position.token;
  let positionToken = props.position.token;

  const [pnl, setPnl] = useState(0);
  const [liqPrice, setLiqPrice] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let fetchedPrice = await getPnl(
        connection,
        props.position,
        //@ts-ignore
        custodyData[props.position.custody.toString()]
      );
      setPnl(fetchedPrice);

      // console.log("pnl percentage", pnl, props.position.collateralUsd);
    }
    if (Object.keys(poolData).length > 0) {
      fetchData();
    }
  }, [poolData]);

  useEffect(() => {
    async function fetchData() {
      let fetchedPrice = await getLiquidationPrice(
        connection,
        props.position,
        // @ts-ignore
        custodyData[props.position.custody.toString()]
      );
      setLiqPrice(fetchedPrice);
    }
    if (Object.keys(poolData).length > 0) {
      fetchData();
    }
  }, [poolData]);

  async function handleCloseTrade() {
    console.log("in close trade");
    await closePosition(
      positionPool,
      //@ts-ignore
      wallet!,
      publicKey!,
      signTransaction!,
      connection,
      props.position,
      positionCustody,
      new BN(stats.currentPrice * 10 ** 6)
    );

    // fetchPositions();
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
            {format(props.position.getTimestamp(), "d MMM yyyy • p")}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">PnL</div>
          <PositionValueDelta
            className="mt-0.5"
            valueDelta={pnl}
            valueDeltaPercentage={pnl / Number(props.position.collateralUsd)}
          />
        </div>
        <div>
          <div className="text-xs text-zinc-500">Size</div>
          <div className="mt-1 flex items-center">
            <div className="text-sm text-white">
              ${formatPrice(Number(props.position.sizeUsd))}
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
            $
            {formatPrice(
              props.position.side === Side.Long
                ? stats.currentPrice - liqPrice
                : liqPrice - stats.currentPrice
            )}
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
