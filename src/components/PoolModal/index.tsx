import LiquidityCard from "@/components/PoolModal/LiquidityCard";
import { Pool } from "@/lib/Pool";
import { ChevronLeft } from "@carbon/icons-react";
import SinglePoolTokens from "./SinglePoolTokens";

interface Props {
  pool: Pool | null;
  setPool: (pool: Pool | null) => void;
}

export default function PoolModal(props: Props) {
  if (props.pool === null) {
    <></>;
  }
}
