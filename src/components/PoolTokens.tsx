import { twMerge } from "tailwind-merge";
import { cloneElement } from "react";

import { getTokenIcon, Token } from "@/lib/Token";

interface Props {
  className?: string;
  tokens: Token[];
}

export function PoolTokens(props: Props) {
  return (
    <div className="flex items-center -space-x-3">
      {props.tokens.slice(0, 3).map((token, i) => {
        const tokenIcon = getTokenIcon(token);

        return cloneElement(tokenIcon, {
          className: twMerge(
            tokenIcon.props.className,
            "border-black",
            "border",
            "rounded-full",
            "h-4",
            "relative",
            "w-4"
          ),
          style: { zIndex: 3 - i },
          key: token,
        });
      })}
    </div>
  );
}
