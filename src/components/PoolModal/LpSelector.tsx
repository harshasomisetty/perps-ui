import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  amount: number;
  onChangeAmount?(amount: number): void;
  maxBalance?: number;
}

export const LpSelector = (props: Props) => {
  return (
    <div>
      <div
        className={twMerge(
          "grid-cols-[max-content,1fr]",
          "bg-zinc-900",
          "grid",
          "h-20",
          "items-center",
          "p-4",
          "rounded",
          "w-full",
          props.className
        )}
      >
        <div className="flex items-center space-x-2">
          <p>LP Tokens</p>
          {props.maxBalance && (
            <button
              className={twMerge(
                "h-min",
                "w-min",
                "bg-purple-500",
                "rounded",
                "py-1",
                "px-2",
                "text-white"
              )}
              onClick={() => props.onChangeAmount?.(props.maxBalance!)}
            >
              Max
            </button>
          )}
        </div>
        <div>
          <input
            className={twMerge(
              "bg-transparent",
              "h-full",
              "text-2xl",
              "text-right",
              "text-white",
              "top-0",
              "w-full",
              "focus:outline-none",
              typeof props.onChangeAmount === "function"
                ? "cursor-pointer"
                : "cursor-none",
              typeof props.onChangeAmount === "function"
                ? "pointer-events-auto"
                : "pointer-events-none"
            )}
            placeholder="0"
            type="number"
            value={props.amount.toFixed(3)}
            onChange={(e) => {
              const value = e.currentTarget.valueAsNumber;
              props.onChangeAmount?.(isNaN(value) ? 0 : value);
            }}
          />
        </div>
      </div>
    </div>
  );
};
