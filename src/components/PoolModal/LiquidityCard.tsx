import { Token } from "@/lib/Token";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";
import { TokenSelector } from "@/components/TokenSelector";

interface Props {
  className?: string;
  tokenList: Token[];
  //   amount: number;
  //   token: Token;
  //   onChangeAmount?(amount: number): void;
  //   onSelectToken?(token: Token): void;
}

export default function LiquidityCard(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">You Add</div>
      </div>
      <TokenSelector
        className="mt-2"
        amount={payAmount}
        token={payToken}
        onChangeAmount={setPayAmount}
        onSelectToken={setPayToken}
        tokenList={props.tokenList}
      />
      <div className="mt-4 text-sm font-medium text-white">You Receive</div>

      <div
        className={twMerge(
          "grid-cols-[max-content,1fr]",
          "bg-zinc-900",
          "grid",
          "h-20",
          "items-center",
          "p-4",
          "rounded",
          "w-full",
          props.className
        )}
      >
        LP Tokens
      </div>

      <SolidButton className="mt-6 w-full">Confirm</SolidButton>
    </div>
  );
}
