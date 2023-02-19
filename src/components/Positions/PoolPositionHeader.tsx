import { PoolPositions } from "@/lib/Position";
import { PoolTokens } from "../PoolTokens";
import { PositionColumn } from "./PositionColumn";

interface Props {
  className?: string;
  poolPositions: PoolPositions;
}

export default function PoolPositionHeader(props: Props) {
  return (
    <>
      <PositionColumn num={1}>
        <div className="flex max-w-fit items-center rounded-t bg-zinc-800 py-1.5 px-2">
          <PoolTokens tokens={props.poolPositions.getTokens()} />
          <div className="ml-1 text-sm font-medium text-white">
            {props.poolPositions.name}
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={2}>Leverage</PositionColumn>
      <PositionColumn num={3}>Net Value</PositionColumn>
      <PositionColumn num={4}>Collateral</PositionColumn>
      <PositionColumn num={5}>Entry Price</PositionColumn>
      <PositionColumn num={6}>Mark Price</PositionColumn>
      <PositionColumn num={7}>Liq. Price</PositionColumn>
    </>
  );
}
