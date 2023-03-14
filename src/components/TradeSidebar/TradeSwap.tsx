import { useEffect, useRef, useState } from "react";
import { TokenE } from "@/lib/Token";
import { swap } from "src/actions/swap";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/store";
import { PoolAccount } from "@/lib/PoolAccount";
import { twMerge } from "tailwind-merge";
import ArrowsVertical from "@carbon/icons-react/lib/ArrowsVertical";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ViewHelper } from "@/utils/viewHelpers";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { LoadingDots } from "@/components/LoadingDots";
import { TokenSelector } from "@/components/TokenSelector";
import { PoolSelector } from "@/components/PoolSelector";
import { SolidButton } from "@/components/SolidButton";
import { TradeSwapDetails } from "@/components/TradeSidebar/TradeSwapDetails";

interface Props {
  className?: string;
}

export function TradeSwap(props: Props) {
  const { connection } = useConnection();
  const { publicKey, signTransaction, wallet } = useWallet();

  const stats = useGlobalStore((state) => state.priceStats);
  const poolData = useGlobalStore((state) => state.poolData);

  const [payToken, setPayToken] = useState<TokenE>();
  const [payAmount, setPayAmount] = useState<number>(1);
  const [receiveToken, setReceiveToken] = useState<TokenE>();
  const [receiveAmount, setReceiveAmount] = useState<number>(0);
  const [fee, setFee] = useState<number>(0);

  const userData = useGlobalStore((state) => state.userData);
  // convert to state

  const [payTokenBalance, setPayTokenBalance] = useState(0);
  const [receiveTokenBalance, setReceiveTokenBalance] = useState(0);

  const [pool, setPool] = useState<PoolAccount | null>(null);

  const timeoutRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (Object.values(poolData).length > 0) {
      setPool(Object.values(poolData)[0]);

      let tokenA = Object.values(poolData)[0]?.getTokenList()[0];
      let tokenB = Object.values(poolData)[0]?.getTokenList()[1];

      setPayToken(tokenA);
      setPayTokenBalance(userData.tokenBalances[tokenA]);
      setReceiveToken(tokenB);
      setReceiveTokenBalance(userData.tokenBalances[tokenB]);
    }
  }, [poolData]);

  useEffect(() => {
    async function fetchData() {
      // console.log("in fetch", payAmount);
      if (payAmount == 0) {
        setReceiveAmount(0);
        setFee(0);
        return;
      }
      let { provider } = await getPerpetualProgramAndProvider(wallet as any);

      const View = new ViewHelper(connection, provider);

      let swapInfo = await View.getSwapAmountAndFees(
        new BN(payAmount * LAMPORTS_PER_SOL),
        pool!,
        pool!.getCustodyAccount(payToken)!,
        pool!.getCustodyAccount(receiveToken)!
      );

      let f = Number(swapInfo.feeOut) / 10 ** 6;

      // TODO check the fees here
      setReceiveAmount(
        Number(swapInfo.amountOut) /
          10 ** pool!.getCustodyAccount(receiveToken)!.decimals -
          f
      );

      // console.log("setting fee????", f);
      // .amountOut.sub(swapInfo.feeIn)
      setFee(f);

      // console.log("getting fee percentage", getFeePercentage());
    }

    if (pool) {
      clearTimeout(timeoutRef.current);

      // set a new timeout to execute after 5 seconds
      timeoutRef.current = setTimeout(() => {
        fetchData();
      }, 1000);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
    // @ts-ignore
  }, [wallet, pool, payAmount]);

  function getFeePercentage() {
    if (fee == 0) {
      return 0;
    }
    return (fee / (stats[receiveToken]?.currentPrice * receiveAmount)) * 100;
  }

  async function handleSwap() {
    // TODO: need to take slippage as param , this is now for testing
    // console.log("in handle swap");
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

  if (!pool || !payToken || !receiveToken || Object.values(stats).length == 0) {
    return <LoadingDots />;
  }

  if (Object.values(stats).length === 0) {
    return (
      <div>
        <p>no stats</p>
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between text-sm">
        <div className="text-sm font-medium text-white">You Pay</div>
        <div
          className="flex flex-row space-x-1 font-medium text-white hover:cursor-pointer"
          onClick={() => setPayAmount(payTokenBalance)}
        >
          {payTokenBalance ? (
            <>
              <p>{payTokenBalance?.toFixed(3) ?? 0}</p>
              <p className="font-normal">{payToken}</p>
              <p className="text-zinc-400"> Balance</p>
            </>
          ) : (
            <LoadingDots />
          )}
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
        liqRatio={0}
      />
      <div className="mt-4 text-sm text-zinc-400">Pool</div>
      <PoolSelector className="mt-2" pool={pool} onSelectPool={setPool} />
      <div className="mt-4">
        <p className="text-sm text-zinc-400">Estimated Fees</p>
        <div className="flex flex-row space-x-1">
          {!fee || typeof fee != "undefined" ? (
            <>
              <p className="text-sm text-white">${fee.toFixed(4)}</p>
              <p className="text-sm text-zinc-500">
                ({getFeePercentage().toFixed(4)}%)
              </p>
            </>
          ) : (
            <LoadingDots />
          )}
        </div>
      </div>
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
        payToken={payToken}
        availableLiquidity={pool
          .getCustodyAccount(receiveToken!)
          ?.getCustodyLiquidity(stats)}
        payTokenPrice={stats[payToken]?.currentPrice || 0}
        receiveToken={receiveToken}
        receiveTokenPrice={stats[receiveToken]?.currentPrice || 0}
      />
    </div>
  );
}
