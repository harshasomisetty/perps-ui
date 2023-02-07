import * as Dropdown from "@radix-ui/react-dropdown-menu";
import CheckmarkIcon from "@carbon/icons-react/lib/Checkmark";
import ChevronDownIcon from "@carbon/icons-react/lib/ChevronDown";
import { twMerge } from "tailwind-merge";
import { cloneElement, useState } from "react";

import { PoolTokens } from "./PoolTokens";
import { getTokenIcon, Token } from "@/lib/Token";
import { Pool } from "@/lib/Pool";
import { usePools } from "@/hooks/usePools";
import { useWallet } from "@solana/wallet-adapter-react";

interface Props {
  className?: string;
  onSelect?(pool: Pool): void;
}

export function PoolSelector(props: Props) {
  const [open, setOpen] = useState(false);

  const { wallet, publicKey, signTransaction } = useWallet();
  const { pools } = usePools(wallet);
  const [selectedPool, setSelectedPool] = useState<Pool>();

  if (!pools || !selectedPool) {
    return <p>Loading</p>;
  } else {
    setSelectedPool(Object.values(pools)[0]);
    // return <p>Loaded</p>;

    return (
      <Dropdown.Root open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger
          className={twMerge(
            "bg-zinc-900",
            "gap-x-1",
            "grid-cols-[24px,1fr,24px]",
            "grid",
            "group",
            "h-11",
            "items-center",
            "px-4",
            "rounded",
            "text-left",
            "w-full",
            props.className
          )}
        >
          <PoolTokens tokens={selectedPool.tokenNames} />
          <div className="truncate text-sm font-medium text-white">
            {selectedPool.name}
          </div>
          <div
            className={twMerge(
              "border-zinc-700",
              "border",
              "grid",
              "h-6",
              "place-items-center",
              "rounded-full",
              "transition-all",
              "w-6",
              "group-hover:border-white",
              open && "-rotate-180"
            )}
          >
            <ChevronDownIcon className="h-4 w-4 fill-white" />
          </div>
        </Dropdown.Trigger>
        <Dropdown.Portal>
          <Dropdown.Content
            sideOffset={8}
            className="w-[392px] overflow-hidden rounded bg-zinc-900 shadow-2xl"
          >
            <Dropdown.Arrow className="fill-zinc-900" />
            {Object.values(pools).map((pool) => (
              <Dropdown.Item
                className={twMerge(
                  "cursor-pointer",
                  "gap-x-1",
                  "grid-cols-[24px,1fr,24px]",
                  "grid",
                  "group",
                  "items-center",
                  "px-4",
                  "py-2.5",
                  "text-left",
                  "transition-colors",
                  "w-full",
                  "hover:bg-zinc-700"
                )}
                key={pool.poolAddress}
                onClick={() => props.onSelect?.(pool)}
              >
                <PoolTokens tokens={pool.tokens} />
                <div>
                  <div className="truncate text-sm font-medium text-white">
                    {pool.poolName}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {pool.tokenNames.slice(0, 3).join(", ")}
                    {pool.tokenNames.length > 3
                      ? ` +${pool.tokenNames.length - 3} more`
                      : ""}
                  </div>
                </div>
                {pool.poolAddress === selectedPool.poolAddress ? (
                  <CheckmarkIcon className="h-4 w-4 fill-white" />
                ) : (
                  <div />
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    );
  }
}
