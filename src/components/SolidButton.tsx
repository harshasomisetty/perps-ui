import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import { LoadingDots } from "./LoadingDots";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
}

export const SolidButton = forwardRef<HTMLButtonElement, Props>(
  function SolidButton(props, ref) {
    const { pending, ...rest } = props;

    return (
      <button
        {...rest}
        ref={ref}
        className={twMerge(
          "bg-purple-500",
          "flex",
          "group",
          "h-14",
          "items-center",
          "justify-center",
          "p-3",
          "relative",
          "rounded",
          "text-white",
          "tracking-normal",
          "transition-colors",
          rest.className,
          !pending && "active:bg-purple-500",
          "disabled:bg-zinc-300",
          "disabled:cursor-not-allowed",
          !pending && "hover:bg-purple-400",
          pending && "cursor-not-allowed"
        )}
        onClick={(e) => {
          if (!pending && !rest.disabled) {
            rest.onClick?.(e);
          }
        }}
      >
        <div
          className={twMerge(
            "flex",
            "items-center",
            "justify-center",
            "text-current",
            "text-sm",
            "transition-all",
            "group-disabled:text-neutral-400",
            pending ? "opacity-0" : "opacity-100"
          )}
        >
          {rest.children}
        </div>
        {pending && (
          <LoadingDots className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
      </button>
    );
  }
);
