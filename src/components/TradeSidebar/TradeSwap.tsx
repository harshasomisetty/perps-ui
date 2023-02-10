import { useEffect, useState } from "react";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { Token } from "@/lib/Token";

import { TokenSelector } from "../TokenSelector";
import { SolidButton } from "../SolidButton";
import { TradeSwapDetails } from "./TradeSwapDetails";
import { swap } from "src/actions/swap";
import { usePools } from "@/hooks/usePools";
import { Pool } from "@/lib/Pool";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";

interface Props {
  className?: string;
}

export function TradeSwap(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);
  const [receiveToken, setReceiveToken] = useState(Token.USDC);
  const [receiveAmount, setReceiveAmount] = useState(0);

  const allPriceStats = useDailyPriceStats();

  const { pools } = usePools();
  const { connection } = useConnection();

  const [pool, setPool] = useState<Pool | null>(null);

  const { publicKey, signTransaction, wallet } = useWallet();


  useEffect(() => {
    const payTokenPrice = allPriceStats[payToken]?.currentPrice || 0;
    const receiveTokenPrice = allPriceStats[receiveToken]?.currentPrice || 0;

    const conversionRatio = payTokenPrice / receiveTokenPrice;

    const receiveAmount = payAmount * conversionRatio;
    setReceiveAmount(receiveAmount);
  }, [payAmount, payToken, receiveToken, allPriceStats]);

  // FIX: using to interdependent useEffects will create a infinite loop change
  // useEffect(() => {
  //   const payTokenPrice = allPriceStats[payToken]?.currentPrice || 0;
  //   const receiveTokenPrice = allPriceStats[receiveToken]?.currentPrice || 0;

  //   const conversionRatio = receiveTokenPrice / payTokenPrice;

  //   const payAmount = receiveAmount * conversionRatio;
  //   setPayAmount(payAmount);
  // }, [receiveAmount, payToken, receiveToken, allPriceStats]);


  // TODO: add pool selection for swap if need , for now fixing it to POOL1
  useEffect(() => {
    if (pools === undefined || pools === null) {
      return;
    } else {
      const pool1 = Object.values(pools).filter(i => i.poolName == 'TestPool1');
      console.log("selected pool:",pool1);
      setPool(pool1[0]);
    }

  }, [pools])
  


  async function handleSwap() {
    // TODO: need to take slippage as param , this is now for testing 
  const newPrice =  (new BN(receiveAmount * 10**6)).mul(new BN(90)).div(new BN(100))

    await swap(
      pool,
      wallet,
      publicKey,
      signTransaction,
      connection,
      receiveToken,
      payToken,
      new BN(payAmount* 10**9),
      newPrice
    );

  }


  return (
    <div className={props.className}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-white">You Pay</div>
      </div>
      <TokenSelector
        className="mt-2"
        amount={payAmount}
        token={payToken}
        onChangeAmount={setPayAmount}
        onSelectToken={setPayToken}
      />
      <div className="mt-4 text-sm font-medium text-white">You Receive</div>
      <TokenSelector
        className="mt-2"
        amount={receiveAmount}
        token={receiveToken}
        onChangeAmount={setReceiveAmount}
        onSelectToken={setReceiveToken}
      />
      <SolidButton className="mt-6 w-full" onClick={handleSwap} >Swap</SolidButton>
      <TradeSwapDetails
        availableLiquidity={3871943.82}
        className="mt-4"
        fees={12.3}
        payToken={payToken}
        payTokenPrice={allPriceStats[payToken]?.currentPrice || 0}
        receiveToken={receiveToken}
        receiveTokenPrice={allPriceStats[receiveToken]?.currentPrice || 0}
      />
    </div>
  );
}
