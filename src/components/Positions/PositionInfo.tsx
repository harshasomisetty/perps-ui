import { twMerge } from "tailwind-merge";
import { cloneElement, useEffect, useState } from "react";
import GrowthIcon from "@carbon/icons-react/lib/Growth";
import EditIcon from "@carbon/icons-react/lib/Edit";
import ChevronDownIcon from "@carbon/icons-react/lib/ChevronDown";
import { ACCOUNT_URL } from "@/lib/TransactionHandlers";
import NewTab from "@carbon/icons-react/lib/NewTab";

import { getTokenAddress, getTokenIcon, getTokenLabel } from "@/lib/Token";
import { PositionColumn } from "./PositionColumn";
import { PositionValueDelta } from "./PositionValueDelta";
import { Position, Side } from "@/lib/Position";
import { getLiquidationPrice } from "src/actions/getPrices";
import { usePools } from "@/hooks/usePools";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

function formatPrice(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  expanded?: boolean;
  position: Position;
  onClickExpand?(): void;
}

export function PositionInfo(props: Props) {
  const tokenIcon = getTokenIcon(props.position.token);

  const { pools } = usePools();

  const { publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  // useState liqPrice
  const [liqPrice, setLiqPrice] = useState(0);

  // use effect get liq price

  useEffect(() => {
    async function fetchData() {
      let token = props.position.token;

      let custody =
        pools[props.position.poolAddress.toString()].tokens[
          getTokenAddress(token)
        ];

      let fetchedPrice = await getLiquidationPrice(
        wallet,
        publicKey,
        connection,
        props.position.poolAddress,
        props.position.positionAccountAddress,
        custody.custodyAccount,
        custody.oracleAccount
      );
      setLiqPrice(fetchedPrice);
    }
    if (pools) {
      fetchData();
    }
  }, [pools]);

  return (
    <div className={twMerge("flex", "items-center", "py-5", props.className)}>
      <PositionColumn num={1}>
        <div
          className={twMerge(
            "gap-x-2",
            "grid-cols-[32px,minmax(0,1fr)]",
            "grid",
            "items-center",
            "overflow-hidden",
            "pl-3"
          )}
        >
          {cloneElement(tokenIcon, {
            className: twMerge(
              tokenIcon.props.className,
              "flex-shrink-0",
              "h-8",
              "w-8"
            ),
          })}
          <div className="pr-2">
            <div className="font-bold text-white">{props.position.token}</div>
            <div className="mt-0.5 truncate text-sm font-medium text-zinc-500">
              {getTokenLabel(props.position.token)}
            </div>
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={2}>
        <div className="text-sm text-white">
          {props.position.leverage.toFixed(2)}x
        </div>
        <div
          className={twMerge(
            "flex",
            "items-center",
            "mt-1",
            "space-x-1",
            props.position.side === Side.Long
              ? "text-emerald-400"
              : "text-rose-400"
          )}
        >
          {props.position.side === Side.Long ? (
            <GrowthIcon className="h-3 w-3 fill-current" />
          ) : (
            <GrowthIcon className="h-3 w-3 -scale-y-100 fill-current" />
          )}
          <div className="text-sm">
            {props.position.side === Side.Long ? "Long" : "Short"}
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={3}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.sizeUsd)}
        </div>
        <PositionValueDelta
          className="mt-0.5"
          valueDelta={props.position.valueDelta}
          valueDeltaPercentage={props.position.valueDeltaPercentage}
        />
      </PositionColumn>
      <PositionColumn num={4}>
        <div className="flex items-center">
          <div className="text-sm text-white">
            ${formatPrice(props.position.collateralUsd)}
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
      </PositionColumn>
      <PositionColumn num={5}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.entryPrice)}
        </div>
      </PositionColumn>
      <PositionColumn num={6}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.markPrice)}
        </div>
      </PositionColumn>
      <PositionColumn num={7}>
        <div className="flex items-center justify-between pr-2">
          <div className="text-sm text-white">${formatPrice(liqPrice)}</div>
          <div className="flex items-center space-x-2">
            {/* <button className="text-white" onClick={liqPrice}>
              liq
            </button> */}
            <a
              target="_blank"
              rel="noreferrer"
              href={`${ACCOUNT_URL(
                props.position.positionAccountAddress.toString()
              )}`}
            >
              <NewTab className="fill-white" />
            </a>
            <button
              className={twMerge(
                "bg-zinc-900",
                "grid",
                "h-6",
                "place-items-center",
                "rounded-full",
                "transition-all",
                "w-6",
                "hover:bg-zinc-700",
                props.expanded && "-rotate-180"
              )}
              onClick={() => props.onClickExpand?.()}
            >
              <ChevronDownIcon className="h-4 w-4 fill-white" />
            </button>
          </div>
        </div>
      </PositionColumn>
    </div>
  );
}
