import { twMerge } from "tailwind-merge";
import ChartCandlestickIcon from "@carbon/icons-react/lib/ChartCandlestick";
import CircleDash from "@carbon/icons-react/lib/CircleDash";
import dynamic from "next/dynamic";
import Link from "next/link";
import StoragePoolIcon from "@carbon/icons-react/lib/StoragePool";

import { NavbarLink } from "./NavbarLink";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navbar = () => {
  return (
    <nav
      className={twMerge(
        "bg-zinc-900",
        "fixed",
        "flex",
        "h-14",
        "justify-between",
        "items-center",
        "left-0",
        "px-4",
        "right-0",
        "top-0"
      )}
    >
      <Link className="hidden items-center space-x-2 md:flex" href="/">
        <CircleDash className="h-7 w-7 fill-white/80" />
        <div className="text-white">APP NAME</div>
      </Link>
      <div className="flex h-full items-center space-x-2">
        <NavbarLink href="/trade" icon={<ChartCandlestickIcon />}>
          Trade
        </NavbarLink>
        <NavbarLink href="/pools" icon={<StoragePoolIcon />}>
          Pools
        </NavbarLink>
        <NavbarLink href="/portfolio" icon={<StoragePoolIcon />}>
          Portfolio
        </NavbarLink>
      </div>
      <div>
        <WalletMultiButtonDynamic className="bg-transparent" />
      </div>
    </nav>
  );
};
