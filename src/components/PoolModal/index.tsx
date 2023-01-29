import { Pool } from "@/hooks/usePools";
import {
  getPoolTokenList,
  getTokenIcon,
  getTokenLabel,
  tokenAddressToToken,
} from "@/lib/Token";
import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import LiquidityCard from "@/components/PoolModal/LiquidityCard";
import SinglePoolTokens from "./SinglePoolTokens";

interface Props {
  pool: Pool | null;
  setPool: (pool: Pool | null) => void;
}

export default function PoolModal(props: Props) {
  if (props.pool === null) {
    <></>;
  }

  return (
    <div className="absolute h-screen w-screen border border-white bg-black p-4 text-white">
      <div className="cursor-pointer" onClick={() => props.setPool(null)}>
        X
      </div>
      <div className="flex flex-row">
        <LiquidityCard pool={props.pool} />
        <SinglePoolTokens pool={props.pool} />
      </div>
    </div>
  );
}
