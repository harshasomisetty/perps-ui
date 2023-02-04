import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  amount: number;
  onChangeAmount?(amount: number): void;
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
        LP Tokens
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
              "focus:outline-none"
            )}
            placeholder="0"
            type="number"
            value={props.amount || ""}
            onChange={(e) => {
              const text = e.currentTarget.value;
              const number = parseFloat(text);
              props.onChangeAmount?.(Number.isNaN(number) ? 0 : number);
            }}
          />
          <div className="mt-0.5 text-right text-xs text-zinc-500">place</div>
          {/* {!!stats[props.token]?.currentPrice && (
              <div className="mt-0.5 text-right text-xs text-zinc-500">
                ${formatNumber(props.amount * stats[props.token].currentPrice)}
              </div>
            )} */}
        </div>
      </div>
    </div>
  );
};
