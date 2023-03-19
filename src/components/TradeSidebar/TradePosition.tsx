import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { asToken, TokenE } from "@/lib/Token";
import { useRouter } from "next/router";
import { openPosition } from "src/actions/openPosition";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useGlobalStore } from "@/stores/store";
import { PoolAccount } from "@/lib/PoolAccount";
import { Side } from "@/lib/types";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { ViewHelper } from "@/utils/viewHelpers";
import { getPositionData } from "@/hooks/storeHelpers/fetchPositions";
import { LoadingDots } from "@/components/LoadingDots";
import { TokenSelector } from "@/components/TokenSelector";
import { PoolSelector } from "@/components/PoolSelector";
import { LeverageSlider } from "@/components/LeverageSlider";
import { SolidButton } from "@/components/SolidButton";
import { TradeDetails } from "@/components/TradeSidebar/TradeDetails";

interface Props {
  className?: string;
  side: Side;
}

enum Input {
  Pay = "pay",
  Position = "position",
}

export function TradePosition(props: Props) {
  const [payToken, setPayToken] = useState<TokenE>();
  const [positionToken, setPositionToken] = useState<TokenE>();

  const [payAmount, setPayAmount] = useState(0.1);
  const [positionAmount, setPositionAmount] = useState(0.2);

  const [lastChanged, setLastChanged] = useState<Input>(Input.Pay);

  const [leverage, setLeverage] = useState(1);

  const { publicKey, wallet } = useWallet();
  const walletContextState = useWallet();

  const { connection } = useConnection();

  const poolData = useGlobalStore((state) => state.poolData);
  const [pool, setPool] = useState<PoolAccount>();

  const custodyData = useGlobalStore((state) => state.custodyData);
  const setPositionData = useGlobalStore((state) => state.setPositionData);

  const [entryPrice, setEntryPrice] = useState(0);
  const [liquidationPrice, setLiquidationPrice] = useState(0);
  const [fee, setFee] = useState(0);

  const stats = useGlobalStore((state) => state.priceStats);
  const router = useRouter();

  const { pair } = router.query;

  const userData = useGlobalStore((state) => state.userData);

  const timeoutRef = useRef(null);

  async function handleTrade() {
    // console.log("in handle trade");
    const payCustody = pool?.getCustodyAccount(payToken);
    const positionCustody = pool?.getCustodyAccount(positionToken);
    await openPosition(
      walletContextState,
      connection,
      pool,
      payCustody,
      positionCustody,
      payAmount,
      positionAmount,
      stats[payToken]?.currentPrice,
      props.side
    );
    const positionInfos = await getPositionData(custodyData);
    setPositionData(positionInfos);
  }

  useEffect(() => {
    // @ts-ignore
    setPositionToken(asToken(pair.split("-")[0]));
    setPayToken(asToken(pair.split("-")[0]));
  }, [pair]);

  useEffect(() => {
    if (Object.values(poolData).length > 0) {
      setPool(Object.values(poolData)[0]);
    }
  }, [poolData]);

  useEffect(() => {
    async function fetchData() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(
        walletContextState
      );

      const View = new ViewHelper(
        perpetual_program.provider.connection,
        perpetual_program.provider
      );

      let payAmt = payAmount;

      if (payToken != positionToken) {
        let swapInfo = await View.getSwapAmountAndFees(
          new BN(payAmount * 10 ** pool!.getCustodyAccount(payToken)!.decimals),
          pool!,
          pool!.getCustodyAccount(payToken)!,
          pool!.getCustodyAccount(positionToken)!
        );

        payAmt =
          Number(swapInfo.amountOut) /
          10 ** pool!.getCustodyAccount(positionToken)!.decimals;
        console.log("payAmt", payAmt);
      }

      if (payAmt > positionAmount) {
        setPositionAmount(payAmt);
      }
      console.log("payAmt and payAmount", payAmt, payAmount);
      let getEntryPrice = await View.getEntryPriceAndFee(
        payAmt,
        positionAmount,
        props.side,
        pool!,
        pool!.getCustodyAccount(positionToken)!
      );

      console.log("get entry values", getEntryPrice);

      setEntryPrice(Number(getEntryPrice.entryPrice) / 10 ** 6);
      setLiquidationPrice(Number(getEntryPrice.liquidationPrice) / 10 ** 6);
      setFee(Number(getEntryPrice.fee) / 10 ** 9);
    }

    if (pool && payAmount && positionAmount && props.side) {
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
  }, [wallet, pool, payAmount, props.side, payToken, positionToken]);

  if (!pair) {
    return (
      <div>
        <p>no pair</p>
        <LoadingDots />
      </div>
    );
  }

  if (!pool) {
    return (
      <div>
        <p>no pool</p>
        <LoadingDots />
      </div>
    );
  }

  if (Object.values(stats).length === 0) {
    return (
      <div>
        <p>no stats</p>
        <LoadingDots />
      </div>
    );
  }

  // TODO redo leverage calculation by seeing how much payToken * price / positionToken * price is

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between text-sm ">
        <div className="font-medium text-white">You Pay</div>
        {publicKey && (
          <div className="flex flex-row space-x-1 font-medium text-white hover:cursor-pointer">
            {userData.tokenBalances[payToken] &&
            userData.tokenBalances[payToken].toFixed(2) ? (
              <>
                <p>{userData.tokenBalances[payToken].toFixed(2)}</p>
                <p className="font-normal">{payToken}</p>
                <p className="text-zinc-400"> Balance</p>
              </>
            ) : (
              <LoadingDots />
            )}
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
        maxBalance={
          userData.tokenBalances[payToken]
            ? userData.tokenBalances[payToken]
            : 0
        }
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
        tokenList={pool.getTokenList()}
      />
      <div className="mt-4 text-xs text-zinc-400">Pool</div>
      <PoolSelector className="mt-2" pool={pool} onSelectPool={setPool} />
      <LeverageSlider
        className="mt-6"
        value={leverage}
        minLeverage={Number(
          pool.getCustodyAccount(positionToken)?.pricing.minInitialLeverage /
            10000
        )}
        maxLeverage={Number(
          pool.getCustodyAccount(positionToken)?.pricing.maxLeverage / 10000
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
      <SolidButton
        className="mt-6 w-full"
        onClick={handleTrade}
        disabled={!publicKey || payAmount === 0}
      >
        Place Order
      </SolidButton>
      {!publicKey && (
        <p className="mt-2 text-center text-xs text-orange-500">
          Please connect wallet to execute order
        </p>
      )}
      {!payAmount && (
        <p className="mt-2 text-center text-xs text-orange-500 ">
          Please specify a valid nonzero amount to pay
        </p>
      )}

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
        collateralToken={payToken!}
        positionToken={positionToken!}
        entryPrice={entryPrice}
        liquidationPrice={liquidationPrice}
        fees={fee}
        availableLiquidity={
          pool.getCustodyAccount(positionToken!)?.getCustodyLiquidity(stats!)!
        }
        borrowRate={
          Number(
            pool.getCustodyAccount(positionToken!!)?.borrowRateState.currentRate
          ) /
          10 ** 9
        }
        side={props.side}
      />
    </div>
  );
}
