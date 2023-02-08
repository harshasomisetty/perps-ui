import { Pool } from "@/lib/Pool";
import { tokenAddressToToken } from "@/lib/Token";
import { PoolTokens } from "./PoolTokens";

interface Props {
  iconClassName?: string;
  pool: Pool;
}

export function PoolHeader(props: Props) {
  return (
    <div className="flex flex-row">
      <PoolTokens
        tokens={props.pool.tokenNames}
        className={props.iconClassName}
      />
      <div>
        <p className="text-2xl font-medium">{props.pool.poolName}</p>
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
