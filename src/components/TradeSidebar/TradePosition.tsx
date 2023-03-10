import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { useDailyPriceStats } from "@/hooks/useDailyPriceStats";
import { asToken, TokenE } from "@/lib/Token";

import { TokenSelector } from "../TokenSelector";
import { LeverageSlider } from "../LeverageSlider";
import { TradeDetails } from "./TradeDetails";
import { SolidButton } from "../SolidButton";
import { PoolSelector } from "../PoolSelector";
import { useRouter } from "next/router";
import { openPosition } from "src/actions/openPosition";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { fetchTokenBalance } from "@/utils/retrieveData";
import { LoadingDots } from "../LoadingDots";
import { useGlobalStore } from "@/stores/store";
import { PoolAccount } from "@/lib/PoolAccount";
import { Side } from "@/lib/types";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ViewHelper } from "@/utils/viewHelpers";

interface Props {
  className?: string;
  side: Side;
}

enum Input {
  Pay = "pay",
  Position = "position",
}

export function TradePosition(props: Props) {
  const [payToken, setPayToken] = useState(TokenE.SOL);
  const [positionToken, setPositionToken] = useState(TokenE.SOL);
  const [payTokenBalance, setPayTokenBalance] = useState<number | null>(null);

  const [payAmount, setPayAmount] = useState(0.1);
  const [positionAmount, setPositionAmount] = useState(0.2);

  const [lastChanged, setLastChanged] = useState<Input>(Input.Pay);

  const [leverage, setLeverage] = useState(1);

  const { publicKey, signTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  const poolData = useGlobalStore((state) => state.poolData);
  const [pool, setPool] = useState<PoolAccount | null>(null);

  const [entryPrice, setEntryPrice] = useState(0);
  const [liquidationPrice, setLiquidationPrice] = useState(0);
  const [fee, setFee] = useState(0);

  const stats = useDailyPriceStats();
  const router = useRouter();

  const { pair } = router.query;

  const timeoutRef = useRef(null);

  async function handleTrade() {
    const payCustody = pool?.getCustodyAccount(payToken);
    const positionCustody = pool?.getCustodyAccount(positionToken);
    await openPosition(
      // @ts-ignore
      wallet,
      publicKey,
      signTransaction,
      connection,
      pool,
      payCustody,
      positionCustody,
      new BN(payAmount * LAMPORTS_PER_SOL),
      new BN(positionAmount * LAMPORTS_PER_SOL),
      new BN(stats[payToken]?.currentPrice * 10 ** 6),
      props.side
    );
    // fetchPositions();
  }

  useEffect(() => {
    // @ts-ignore
    setPositionToken(asToken(pair.split("-")[0]));
  }, [pair]);

  useEffect(() => {
    async function fetchData() {
      let tokenBalance = await fetchTokenBalance(
        payToken,
        publicKey!,
        connection
      );

      setPayTokenBalance(tokenBalance);
    }
    if (publicKey) {
      fetchData();
    }
  }, [connection, payToken, publicKey]);

  useEffect(() => {
    async function fetchData() {
      let { provider } = await getPerpetualProgramAndProvider(wallet as any);

      const View = new ViewHelper(connection, provider);

      console.log("in get entry");

      let getEntryPrice = await View.getEntryPriceAndFee(
        new BN(payAmount * LAMPORTS_PER_SOL),
        new BN(positionAmount * LAMPORTS_PER_SOL),
        props.side,
        pool,
        pool?.getCustodyAccount(positionToken)
      );

      console.log("get entry", getEntryPrice);

      setEntryPrice(Number(getEntryPrice.entryPrice) / 10 ** 6);
      setLiquidationPrice(Number(getEntryPrice.liquidationPrice) / 10 ** 6);
      setFee(Number(getEntryPrice.fee) / 10 ** 9);
    }
    console.log(
      "in fetching entry outside",
      pool,
      payAmount,
      positionAmount,
      props.side
    );
    if (pool && payAmount && positionAmount && props.side) {
      console.log("about to actually fetch");

      // clear previous timeout, if it exists
      clearTimeout(timeoutRef.current);

      // set a new timeout to execute after 5 seconds
      timeoutRef.current = setTimeout(() => {
        fetchData();
      }, 1000);
    }
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [wallet, pool, payAmount, positionAmount, props.side]);

  // const entryPrice = stats[payToken]?.currentPrice * payAmount || 0;
  // const liquidationPrice = entryPrice * leverage;

  if (!pair) {
    return <p>Pair not loaded</p>;
  }

  if (Object.keys(poolData).length === 0) {
    return <LoadingDots />;
  } else if (pool === null) {
    // console.log("setting pool", poolData);
    // @ts-ignore
    console.log("all pools", Object.values(poolData));
    setPool(Object.values(poolData)[0]);
    return <LoadingDots />;
  } else {
    console.log("sending borrow", pool.getCustodyAccount(positionToken));
    return (
      <div className={props.className}>
        <div className="flex items-center justify-between text-sm ">
          <div className="font-medium text-white">You Pay</div>
          {publicKey && (
            <div
              className="flex flex-row space-x-1 font-medium text-white hover:cursor-pointer"
              onClick={() => setPayAmount(payTokenBalance)}
            >
              <p>{payTokenBalance?.toFixed(3) ?? 0}</p>
              <p className="font-normal">{payToken}</p>
              <p className="text-zinc-400"> Balance</p>
            </div>
          )}
        </div>
        <TokenSelector
          className="mt-2"
          amount={payAmount}
          token={payToken}
          onChangeAmount={(e) => {
            console.log("token selector wrp on change", e);
            setPayAmount(e);
            setPositionAmount(e * leverage);
            setLastChanged(Input.Pay);
          }}
          onSelectToken={setPayToken}
          tokenList={pool.getTokenList()}
        />
        <div className="mt-4 text-sm font-medium text-white">
          Your {props.side}
        </div>
        <TokenSelector
          className="mt-2"
          amount={positionAmount}
          token={positionToken}
          onChangeAmount={(e) => {
            setPayAmount(e / leverage);
            setPositionAmount(e);
            setLastChanged(Input.Position);
          }}
          onSelectToken={(token) => {
            setPositionToken(token);
            router.push("/trade/" + token + "-USD");
          }}
          liqRatio={0}
          setLiquidity={null}
          tokenList={pool.getTokenList()}
        />
        <div className="mt-4 text-xs text-zinc-400">Pool</div>
        <PoolSelector className="mt-2" pool={pool} onSelectPool={setPool} />
        <LeverageSlider
          className="mt-6"
          value={leverage}
          // maxLeverage={50}
          maxLeverage={Number(
            pool.getCustodyAccount(positionToken)?.pricing.maxLeverage
          )}
          onChange={(e) => {
            if (lastChanged === Input.Pay) {
              setPositionAmount(payAmount * e);
            } else {
              setPayAmount(positionAmount / e);
            }
            setLeverage(e);
          }}
        />
        <SolidButton className="mt-6 w-full" onClick={handleTrade}>
          Place Order
        </SolidButton>
        <TradeDetails
          className={twMerge(
            "-mb-4",
            "-mx-4",
            "bg-zinc-900",
            "mt-4",
            "pb-5",
            "pt-4",
            "px-4"
          )}
          collateralToken={payToken}
          positionToken={positionToken}
          entryPrice={entryPrice}
          liquidationPrice={liquidationPrice}
          fees={fee}
          availableLiquidity={pool.getLiquidities(stats)}
          borrowRate={
            Number(
              pool.getCustodyAccount(positionToken)?.borrowRateState.currentRate
            ) /
            10 ** 9
          }
          side={props.side}
        />
      </div>
    );
  }
}
