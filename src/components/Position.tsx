import { twMerge } from "tailwind-merge";
import { useState } from "react";

import { Position } from "@/hooks/usePositions";
import { PositionInfo } from "./PositionInfo";
import { PositionAdditionalInfo } from "./PositionAdditionalInfo";

interface Props {
  className?: string;
  position: Position;
}

export function Position(props: Props) {
  const [expanded, setExpanded] = useState(false);
  console.log("position props", props);

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
