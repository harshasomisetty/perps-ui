import { PoolTokens } from "@/components/PoolTokens";
import { twMerge } from "tailwind-merge";
import { ACCOUNT_URL } from "@/lib/TransactionHandlers";
import NewTab from "@carbon/icons-react/lib/NewTab";
import { PoolAccount } from "@/lib/PoolAccount";

interface Props {
  className?: string;
  iconClassName?: string;
  pool: PoolAccount;
}

export function TitleHeader(props: Props) {
  return (
    <div className={twMerge("flex", "flex-col", "space-x-1", props.className)}>
      <div className="flex flex-row items-center">
        <PoolTokens
          tokens={props.pool.getTokenList()}
          className={props.iconClassName}
        />
        <p className={twMerge("font-medium", "text-2xl")}>{props.pool.name}</p>
        <a
          target="_blank"
          rel="noreferrer"
          href={`${ACCOUNT_URL(props.pool.address.toString())}`}
        >
          <NewTab />
        </a>
      </div>
      <div className="text-s mt-3 flex flex-row font-medium text-zinc-500">
        <p>{props.pool.getTokenList().join(", ")}</p>
      </div>
    </div>
  );
}
