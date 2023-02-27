import { PoolTokens } from "@/components/PoolTokens";
import { Pool } from "@/lib/Pool";
import { tokenAddressToToken } from "@/lib/Token";
import { twMerge } from "tailwind-merge";

interface Props {
  iconClassName?: string;
  poolClassName?: string;
  pool: Pool;
}

export function TableHeader(props: Props) {
  return (
    <div className="flex flex-row space-x-1">
      {Object.keys(props.pool.tokens).length > 0 ? (
        <PoolTokens
          tokens={props.pool.tokenNames}
          className={props.iconClassName}
        />
      ) : (
        <div className={props.iconClassName}></div>
      )}
      <div>
        <p className={twMerge("font-medium", props.poolClassName)}>
          {props.pool.poolName}
        </p>
        <div className="flex flex-row text-xs font-medium text-zinc-500 ">
          <p>{tokenAddressToToken(Object.keys(props.pool.tokens)[0]!)}</p>

          {Object.keys(props.pool.tokens)
            .slice(1)
            .map((tokenMint) => (
              <p key={tokenMint.toString()}>
                , {tokenAddressToToken(tokenMint)}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
