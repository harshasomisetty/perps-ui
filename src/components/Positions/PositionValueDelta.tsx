import { twMerge } from "tailwind-merge";

function formatValueDelta(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 4,
  });
  return formatter.format(num);
}

function formatValueDeltaPercentage(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  valueDelta: number;
  valueDeltaPercentage: number;
  formatValueDelta(value: number): string;
  formatValueDeltaPercentage(value: number): string;
}

export function PositionValueDelta(props: Props) {
  return (
    <div className={twMerge("flex", "items-center", props.className)}>
      <div
        className={twMerge(
          "text-sm",
          "font-medium",
          props.valueDelta > 0 ? "text-emerald-400" : "text-rose-400"
        )}
      >
        {props.valueDelta > 0 && "+"}
        {props.formatValueDelta(props.valueDelta)}
      </div>
      <div
        className={twMerge(
          "ml-1",
          "px-1",
          "rounded",
          "text-black",
          "text-sm",
          props.valueDeltaPercentage > 0 ? "bg-emerald-400" : "bg-rose-400"
        )}
      >
        {props.valueDeltaPercentage > 0 && "+"}
        {props.formatValueDeltaPercentage(props.valueDeltaPercentage)}%
      </div>
    </div>
  );
}

PositionValueDelta.defaultProps = {
  formatValueDelta,
  formatValueDeltaPercentage,
};
