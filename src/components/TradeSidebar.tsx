import { twMerge } from "tailwind-merge";
import { useState } from "react";
import GrowthIcon from "@carbon/icons-react/lib/Growth";
import ArrowsHorizontalIcon from "@carbon/icons-react/lib/ArrowsHorizontal";

import { SidebarTab } from "./SidebarTab";
import { TradeLong } from "./TradeLong";
import { Token } from "./TokenSelector";
import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";

enum Tab {
  Long,
  Short,
  Swap,
}

interface Props {
  className?: string;
  inputPayToken: Token;
  outputPayToken: Token;
}

export function TradeSidebar(props: Props) {
  const [tab, setTab] = useState(Tab.Long);

  const stats = useDailyPriceStats(props.inputPayToken);

  return (
    <div className={props.className}>
      <div className="mb-3 font-medium text-white">Place a Market Order</div>
      <div
        className={twMerge(
          "bg-zinc-900",
          "border-[rgba(255,255,255,0.04)]",
          "border",
          "p-4",
          "rounded"
        )}
      >
        <div className="grid grid-cols-3 gap-x-1 rounded bg-black p-1">
          <SidebarTab
            selected={tab === Tab.Long}
            onClick={() => setTab(Tab.Long)}
          >
            <GrowthIcon className="h-4 w-4" />
            <div>Long</div>
          </SidebarTab>
          <SidebarTab
            selected={tab === Tab.Short}
            onClick={() => setTab(Tab.Short)}
          >
            <GrowthIcon className="h-4 w-4 -scale-y-100" />
            <div>Short</div>
          </SidebarTab>
          <SidebarTab
            selected={tab === Tab.Swap}
            onClick={() => setTab(Tab.Swap)}
          >
            <ArrowsHorizontalIcon className="h-4 w-4" />
            <div>Swap</div>
          </SidebarTab>
        </div>
        {tab === Tab.Long && (
          <TradeLong
            className="mt-6"
            inputPayToken={props.inputPayToken}
            outputPayToken={props.outputPayToken}
          />
        )}
      </div>
    </div>
  );
}
