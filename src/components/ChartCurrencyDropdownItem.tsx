import { twMerge } from "tailwind-merge";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

interface Props {
  className?: string;
  href: string;
  label: string;
}

export function ChartCurrencyDropdownItem(props: Props) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        className={twMerge(
          "px-4",
          "py-2",
          "text-xl",
          "text-white",
          "transition-colors",
          "hover:bg-black/40",
          "hover:outline-none",
          props.className
        )}
        href={props.href}
      >
        {props.label}
      </Link>
    </DropdownMenu.Item>
  );
}
