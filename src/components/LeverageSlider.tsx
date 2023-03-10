import * as Slider from "@radix-ui/react-slider";
import { twMerge } from "tailwind-merge";
import CloseIcon from "@carbon/icons-react/lib/Close";

function formatNumber(num: number) {
  const formatter = Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return formatter.format(num);
}

function clamp(num: number, min: number, max: number) {
  return Math.min(max, Math.max(num, min));
}

interface Props {
  className?: string;
  value: number;
  maxLeverage: number;
  onChange?(value: number): void;
}

export function LeverageSlider(props: Props) {
  return (
    <div
      className={twMerge(
        "grid",
        "grid-cols-[max-content,max-content,1fr,max-content,max-content]",
        "items-center",
        props.className
      )}
    >
      <div className="text-xs text-zinc-400">Leverage</div>
      <div className="pl-6 pr-3 text-sm text-zinc-400">1x</div>
      <div>
        <Slider.Root
          min={1}
          max={props.maxLeverage}
          step={0.01}
          value={[props.value]}
          onValueChange={(values) => props.onChange?.(values[0] || 1)}
        >
          <Slider.Track className="relative block h-2 rounded-sm bg-zinc-900">
            <Slider.Range className="absolute block h-2 rounded-sm bg-purple-400" />
            <Slider.Thumb
              className={twMerge(
                "-translate-y-1/2",
                "bg-white",
                "block",
                "cursor-pointer",
                "h-5",
                "mt-1",
                "rounded-sm",
                "transition-all",
                "w-2",
                "hover:outline",
                "hover:outline-[3px]",
                "hover:outline-white/20"
              )}
            />
          </Slider.Track>
        </Slider.Root>
      </div>
      <div className="pl-3 pr-6 text-sm text-zinc-400">
        {props.maxLeverage}x
      </div>
      <div
        className={twMerge(
          "bg-zinc-900",
          "grid-cols-[1fr,max-content]",
          "grid",
          "items-center",
          "px-3",
          "py-2",
          "rounded",
          "w-20"
        )}
      >
        <input
          className="w-full bg-transparent text-center text-sm text-white"
          type="number"
          value={formatNumber(props.value)}
          onChange={(e) => {
            const text = e.currentTarget.value;
            const number = parseFloat(text);
            // in order to allow the user to input numbers between 1 and 10, we
            // set the value to 0 instead of 1 when the user clears the input
            props.onChange?.(
              Number.isNaN(number) ? 0 : clamp(number, 1, props.maxLeverage)
            );
          }}
          onBlur={(e) => {
            const text = e.currentTarget.value;
            const number = parseFloat(text);
            // when the user blurs, in contrast to when the user is typing, we
            // reset the value to 1 since we want to ensure this selector
            // only produces valid values
            props.onChange?.(
              Number.isNaN(number) ? 1 : clamp(number, 1, props.maxLeverage)
            );
          }}
        />
        <button onClick={() => props.onChange?.(1)}>
          <CloseIcon
            className={twMerge(
              "fill-gray-500",
              "h-4",
              "transition-colors",
              "w-4",
              "hover:fill-white"
            )}
          />
        </button>
      </div>
    </div>
  );
}
