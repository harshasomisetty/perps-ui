import { Pool } from "@/hooks/usePools";

interface Props {
  pool: Pool | null;
  setPool: (pool: Pool | null) => void;
}

export default function PoolModal(props: Props) {
  console.log("pool in pool modal", props.pool);

  if (props.pool === null) {
    <></>;
  }

  return (
    <div className="absolute h-screen w-screen border border-white bg-black p-4 text-white">
      <div className="flex flex-row">
        <p>Add Liquidity</p>
        <div className="cursor-pointer" onClick={() => props.setPool(null)}>
          X
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div>insert liq card</div>
        <div>
          <p>modal Pool: {props.pool.poolName}</p>
        </div>
      </div>
    </div>
  );
}
