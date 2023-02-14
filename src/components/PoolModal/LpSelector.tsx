import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  amount: number;
  onChangeAmount?(amount: number): void;
}

export const LpSelector = (props: Props) => {
  console.log("on change amt exists");
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
            value={props.amount || ""}
            onChange={(e) => {
              const text = e.currentTarget.value;
              const number = parseFloat(text);
              props.onChangeAmount?.(Number.isNaN(number) ? 0 : number);
            }}
          />
        </div>
      </div>
    </div>
  );
};
