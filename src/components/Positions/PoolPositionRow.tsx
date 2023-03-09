import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

import { PositionInfo } from "./PositionInfo";
import { PositionAdditionalInfo } from "./PositionAdditionalInfo";
import { PositionAccount } from "@/lib/PositionAccount";
import { getLiquidationPrice, getPnl } from "src/actions/getPrices";
import { useConnection } from "@solana/wallet-adapter-react";
import { LoadingDots } from "../LoadingDots";
import { useGlobalStore } from "@/stores/store";

interface Props {
  className?: string;
  position: PositionAccount;
}

export function SinglePosition(props: Props) {
  const { connection } = useConnection();

  const poolData = useGlobalStore((state) => state.poolData);
  const custodyData = useGlobalStore((state) => state.custodyData);

  const [expanded, setExpanded] = useState(false);

  const [pnl, setPnl] = useState<number | null>(null);
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

  if (pnl === null) {
    return <LoadingDots />;
  }

  return (
    <div className={twMerge(expanded && "bg-zinc-800", props.className)}>
      <PositionInfo
        className="transition-colors"
        expanded={expanded}
        position={props.position}
        pnl={pnl}
        liqPrice={liqPrice}
        onClickExpand={() => setExpanded((cur) => !cur)}
      />
      <PositionAdditionalInfo
        className={twMerge(
          "transition-all",
          expanded ? "opacity-100" : "opacity-0",
          expanded ? "py-5" : "py-0",
          expanded ? "h-auto" : "h-0"
        )}
        position={props.position}
        pnl={pnl}
        liqPrice={liqPrice}
      />
    </div>
  );
}
