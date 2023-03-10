import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

import { PositionInfo } from "./PositionInfo";
import { PositionAdditionalInfo } from "./PositionAdditionalInfo";
import { PositionAccount } from "@/lib/PositionAccount";
import { getLiquidationPrice } from "src/actions/getPrices";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LoadingDots } from "../LoadingDots";
import { useGlobalStore } from "@/stores/store";
import { ProfitAndLoss, ViewHelper } from "@/utils/viewHelpers";
import { getPerpetualProgramAndProvider } from "@/utils/constants";

interface Props {
  className?: string;
  position: PositionAccount;
}

export function SinglePosition(props: Props) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, wallet } = useWallet();

  const poolData = useGlobalStore((state) => state.poolData);
  const custodyData = useGlobalStore((state) => state.custodyData);

  const [expanded, setExpanded] = useState(false);

  const [pnl, setPnl] = useState<number>(0);
  const [liqPrice, setLiqPrice] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let { provider } = await getPerpetualProgramAndProvider(wallet as any);

      const View = new ViewHelper(connection, provider);

      let fetchedPrice = await View.getPnl(props.position);

      let finalPnl = Number(fetchedPrice.profit)
        ? Number(fetchedPrice.profit)
        : -1 * Number(fetchedPrice.loss);
      setPnl(finalPnl / 10 ** 6);
    }
    if (Object.keys(poolData).length > 0) {
      fetchData();
    }
  }, [poolData]);

  useEffect(() => {
    async function fetchData() {
      let { provider } = await getPerpetualProgramAndProvider(wallet as any);

      const View = new ViewHelper(connection, provider);

      let fetchedPrice = await View.getLiquidationPrice(props.position);

      setLiqPrice(Number(fetchedPrice) / 10 ** 6);
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
