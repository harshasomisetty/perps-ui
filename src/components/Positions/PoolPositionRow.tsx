import { twMerge } from "tailwind-merge";
import { useState } from "react";

import { PositionInfo } from "./PositionInfo";
import { PositionAdditionalInfo } from "./PositionAdditionalInfo";
import { PositionAccount } from "@/lib/PositionAccount";

interface Props {
  className?: string;
  position: PositionAccount;
}

export function SinglePosition(props: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={twMerge(expanded && "bg-zinc-800", props.className)}>
      <PositionInfo
        className="transition-colors"
        expanded={expanded}
        position={props.position}
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
      />
    </div>
  );
}
