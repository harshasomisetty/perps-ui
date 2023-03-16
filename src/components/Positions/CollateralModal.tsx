import { SidebarTab } from "@/components/SidebarTab";
import { Close } from "@carbon/icons-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import Add from "@carbon/icons-react/lib/Add";
import Subtract from "@carbon/icons-react/lib/Subtract";
import { useGlobalStore } from "@/stores/store";
import { PoolAccount } from "@/lib/PoolAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import { TokenSelector } from "@/components/TokenSelector";
import { LpSelector } from "@/components/PoolModal/LpSelector";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";

interface Props {
  className?: string;
  children?: React.ReactNode;
  position: PositionAccount;
}

enum Tab {
  Add,
  Remove,
}

export function CollateralModal(props: Props) {
  const [tab, setTab] = useState(Tab.Add);
  const { wallet, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // const [payToken, setPayToken] = useState(props.pool.getTokenList()[0]);

  const poolData = useGlobalStore((state) => state.poolData);
  const setCustodyData = useGlobalStore((state) => state.setCustodyData);

  const userData = useGlobalStore((state) => state.userData);

  // console.log("props.", props.position);

  let pool = poolData[props.position.pool.toString()]!;

  const [payToken, setPayToken] = useState(pool.getTokenList()[0]);

  let payTokenBalance = userData.tokenBalances[pool.getTokenList()[0]!];
  let liqBalance = userData.lpBalances[pool.address.toString()];

  const [liqAmount, setLiqAmount] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(1);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{props.children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed top-0 bottom-0 left-0 right-0 grid place-items-center bg-black/80 text-white">
          <Dialog.Content className="mt-6 max-w-sm rounded bg-zinc-800 p-4">
            {/* <Dialog.Title className="DialogTitle">Modify Position</Dialog.Title> */}
            {/* <Dialog.Description className="DialogDescription">
              Modify your position by adding or removing collateral.
            </Dialog.Description> */}
            <div className="mb-2 grid grid-cols-2 gap-x-1 rounded bg-black p-1">
              <SidebarTab
                selected={tab === Tab.Add}
                onClick={() => {
                  // setLiqAmount(0);
                  // setTokenAmount(0);
                  setTab(Tab.Add);
                }}
              >
                <Add className="h-4 w-4" />
                <div>Deposit</div>
              </SidebarTab>
              <SidebarTab
                selected={tab === Tab.Remove}
                onClick={() => {
                  // setLiqAmount(0);
                  // setTokenAmount(0);
                  setTab(Tab.Remove);
                }}
              >
                <Subtract className="h-4 w-4" />
                <div>Withdraw</div>
              </SidebarTab>
            </div>
            <div>
              <div className="flex items-center justify-between">
                {tab === Tab.Add ? (
                  <>
                    <div className="text-sm font-medium text-white">
                      You Add
                    </div>
                    {publicKey && (
                      <div>
                        Balance: {payTokenBalance && payTokenBalance.toFixed(3)}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-white">
                      You Remove
                    </div>
                    {publicKey && (
                      <div>Balance: {liqBalance && liqBalance.toFixed(3)}</div>
                    )}
                  </>
                )}
              </div>
              {tab === Tab.Add ? (
                <TokenSelector
                  className="mt-2"
                  amount={tokenAmount}
                  token={payToken!}
                  onChangeAmount={setTokenAmount}
                  onSelectToken={setPayToken}
                  tokenList={[props.position.token]}
                  maxBalance={payTokenBalance}
                />
              ) : (
                <LpSelector
                  className="mt-2"
                  amount={liqAmount}
                  onChangeAmount={setLiqAmount}
                  maxBalance={liqBalance}
                />
              )}
            </div>

            <div className={twMerge("grid", "grid-cols-2", "gap-4", "pt-2")}>
              {[
                { label: "Size", value: "0.00" },
                { label: "Mark Price", value: "0.00" },
                { label: "Leverage", value: "0.00" },
                { label: "Borrow Fee", value: "0.00" },
                { label: "Collateral", value: "0.00" },
                { label: "Liq Price", value: "0.00" },
                { label: "Execution Fee", value: "0.00" },
              ].map(({ label, value }, i) => (
                <div
                  className={twMerge(
                    "border-zinc-700",
                    "pb-2",
                    i < 6 && "border-b",
                    i > 3 && "col-span-2"
                  )}
                  key={i}
                >
                  <div className="text-xs text-zinc-400">{label}</div>
                  <div className="text-sm text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="flex-end flex pt-2">
              <Dialog.Close asChild>
                <SolidButton
                  className="w-full"
                  disabled={!publicKey || !tokenAmount}
                >
                  {tab === Tab.Add ? "Add Collateral" : "Remove Collateral"}
                </SolidButton>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
