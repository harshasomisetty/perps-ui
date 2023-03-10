import { useEffect, useState } from "react";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { TokenE } from "@/lib/Token";

import { TokenSelector } from "../TokenSelector";
import { SolidButton } from "../SolidButton";
import { TradeSwapDetails } from "./TradeSwapDetails";
import { swap } from "src/actions/swap";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/store";
import { PoolAccount } from "@/lib/PoolAccount";
import { twMerge } from "tailwind-merge";
import { PoolSelector } from "../PoolSelector";
import { LoadingDots } from "../LoadingDots";
import { fetchTokenBalance } from "@/utils/retrieveData";
import ArrowsVertical from "@carbon/icons-react/lib/ArrowsVertical";

interface Props {
  className?: string;
}

export function TradeSwap(props: Props) {
  const [payToken, setPayToken] = useState(TokenE.SOL);
  const [payAmount, setPayAmount] = useState(1);
  const [payTokenBalance, setPayTokenBalance] = useState<number | null>(null);

  const [receiveToken, setReceiveToken] = useState(TokenE.TEST);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [receiveTokenBalance, setReceiveTokenBalance] = useState<number | null>(
    null
  );

  const allPriceStats = useDailyPriceStats();

  const { connection } = useConnection();
  const router = useRouter();

  const poolData = useGlobalStore((state) => state.poolData);
  const [pool, setPool] = useState<PoolAccount | null>(null);

  const { publicKey, signTransaction, wallet } = useWallet();

  useEffect(() => {
    const payTokenPrice = allPriceStats[payToken]?.currentPrice || 0;
    const receiveTokenPrice = allPriceStats[receiveToken]?.currentPrice || 0;

    const conversionRatio = payTokenPrice / receiveTokenPrice;

    const receiveAmount = payAmount * conversionRatio;
    setReceiveAmount(receiveAmount);
  }, [payAmount, payToken, receiveToken, allPriceStats]);

  async function handleSwap() {
    // TODO: need to take slippage as param , this is now for testing
    console.log("in handle swap");
    const newPrice = new BN(receiveAmount * 10 ** 6)
      .mul(new BN(90))
      .div(new BN(100));

    await swap(
      wallet,
      publicKey,
      signTransaction,
      connection,
      pool,
      payToken,
      receiveToken,
      new BN(payAmount * 10 ** 9),
      newPrice
    );

    router.reload(window.location.pathname);
  }

  useEffect(() => {
    async function fetchData() {
      let payTokenBalance = await fetchTokenBalance(
        payToken,
        publicKey!,
        connection
      );

      let receiveTokenBalance = await fetchTokenBalance(
        receiveToken,
        publicKey!,
        connection
      );

      setPayTokenBalance(payTokenBalance);
      setReceiveTokenBalance(receiveTokenBalance);
    }
    if (publicKey) {
      fetchData();
    }
  }, [connection, payToken, publicKey]);

  if (Object.keys(poolData).length === 0) {
    return <LoadingDots />;
  } else if (pool === null) {
    // console.log("setting pool", poolData);
    // @ts-ignore
    setPool(Object.values(poolData)[0]);
    return <LoadingDots />;
  } else {
    return (
      <div className={props.className}>
        <div className="flex items-center justify-between text-sm">
          <div className="text-sm font-medium text-white">You Pay</div>
          <div
            className="flex flex-row space-x-1 font-medium text-white hover:cursor-pointer"
            onClick={() => setPayAmount(payTokenBalance)}
          >
            <p>{payTokenBalance?.toFixed(3) ?? 0}</p>
            <p className="font-normal">{payToken}</p>
            <p className="text-zinc-400"> Balance</p>
          </div>
        </div>
        <TokenSelector
          className="mt-2"
          amount={payAmount}
          token={payToken}
          onChangeAmount={setPayAmount}
          onSelectToken={setPayToken}
          tokenList={pool.getTokenList()}
        />
        <div
          className="mt-4 mb-2 flex justify-center"
          onClick={() => {
            setPayToken(receiveToken);
            setReceiveToken(payToken);
          }}
        >
          {" "}
          <ArrowsVertical
            className={twMerge(
              "fill-gray-500",
              "h-5",
              "transition-colors",
              "w-5",
              "hover:fill-white"
            )}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="text-sm font-medium text-white">You Receive</div>
          <div
            className="flex flex-row space-x-1 font-medium text-white hover:cursor-pointer"
            onClick={() => setReceiveAmount(receiveTokenBalance)}
          >
            <p>{receiveTokenBalance?.toFixed(3) ?? 0}</p>
            <p className="font-normal">{receiveToken}</p>
            <p className="text-zinc-400"> Balance</p>
          </div>
        </div>
        <TokenSelector
          className="mt-2"
          amount={receiveAmount}
          token={receiveToken}
          onChangeAmount={setReceiveAmount}
          onSelectToken={setReceiveToken}
          tokenList={pool.getTokenList().filter((token) => token !== payToken)}
        />
        <div className="mt-4 text-xs text-zinc-400">Pool</div>
        <PoolSelector className="mt-2" pool={pool} onSelectPool={setPool} />
        <SolidButton className="mt-6 w-full" onClick={handleSwap}>
          Swap
        </SolidButton>
        <TradeSwapDetails
          className={twMerge(
            "-mb-4",
            "-mx-4",
            "bg-zinc-900",
            "mt-4",
            "pb-5",
            "pt-4",
            "px-4"
          )}
          fees={12.3}
          payToken={payToken}
          availableLiquidity={pool!.getLiquidities(allPriceStats)!}
          payTokenPrice={allPriceStats[payToken]?.currentPrice || 0}
          receiveToken={receiveToken}
          receiveTokenPrice={allPriceStats[receiveToken]?.currentPrice || 0}
        />
      </div>
    );
  }
}
