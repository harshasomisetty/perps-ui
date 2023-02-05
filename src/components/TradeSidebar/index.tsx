import { twMerge } from "tailwind-merge";
import { useState } from "react";
import GrowthIcon from "@carbon/icons-react/lib/Growth";
import ArrowsHorizontalIcon from "@carbon/icons-react/lib/ArrowsHorizontal";

import { SidebarTab } from "../SidebarTab";
import { TradeSwap } from "@/components/TradeSidebar/TradeSwap";
import { TradePosition } from "./TradePosition";

export enum Tab {
  Long = "Long",
  Short = "Short",
  Swap = "Swap",
}

interface Props {
  className?: string;
}

export function TradeSidebar(props: Props) {
  const [tab, setTab] = useState(Tab.Long);

  return (
    <div className={props.className}>
      <div className="mb-3 font-medium text-white">Place a Market Order</div>
      <div
        className={twMerge("bg-zinc-800", "p-4", "rounded", "overflow-hidden")}
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
        {tab === Tab.Long && <TradePosition className="mt-6" side={Tab.Long} />}
        {tab === Tab.Short && (
          <TradePosition className="mt-6" side={Tab.Short} />
        )}
        {tab === Tab.Swap && <TradeSwap className="mt-6" />}
      </div>
    </div>
  );
}
