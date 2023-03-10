import { twMerge } from "tailwind-merge";
import { cloneElement } from "react";

import { getTokenIcon, TokenE } from "@/lib/Token";

interface Props {
  className?: string;
  tokens: TokenE[];
}

export function PoolTokens(props: Props) {
  // console.log("tokens", props.tokens);
  return (
    <div className="flex items-center -space-x-6">
      {props.tokens.slice(0, 3).map((token, i) => {
        const tokenIcon = getTokenIcon(token);

        return cloneElement(tokenIcon, {
          className: twMerge(
            tokenIcon.props.className,
            props.className,
            "border-black",
            "border",
            "rounded-full",
            "relative"
          ),
          style: { zIndex: 3 - i },
          key: i,
        });
      })}
    </div>
  );
}
