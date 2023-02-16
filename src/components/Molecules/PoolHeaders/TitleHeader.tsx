import { PoolTokens } from "@/components/PoolTokens";
import { Pool } from "@/lib/Pool";
import { tokenAddressToToken } from "@/lib/Token";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  iconClassName?: string;
  poolClassName?: string;
  pool: Pool;
}

export function TitleHeader(props: Props) {
  return (
    <div className={twMerge("flex", "flex-col", "space-x-1", props.className)}>
      <div className="flex flex-row">
        <PoolTokens
          tokens={props.pool.tokenNames}
          className={props.iconClassName}
        />
        <p className={twMerge("font-medium", "text-2xl")}>
          {props.pool.poolName}
        </p>
      </div>
      <div className="flex flex-row text-xs font-medium text-zinc-500 ">
        <p>{tokenAddressToToken(Object.keys(props.pool.tokens)[0]!)}</p>

        {Object.keys(props.pool.tokens)
          .slice(1)
          .map((tokenMint) => (
            <p key={tokenMint.toString()}>, {tokenAddressToToken(tokenMint)}</p>
          ))}
      </div>
    </div>
  );
}
