import { getTokenAddress, Token, tokenAddressToToken } from "@/lib/Token";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { SolidButton } from "@/components/SolidButton";
import { TokenSelector } from "@/components/TokenSelector";
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Pool, usePools } from "@/hooks/usePools";
import { manualSendTransaction } from "@/utils/manualTransaction";
import BN from "bn.js";
import { checkIfAccountExists } from "@/utils/retrieveData";

interface Props {
  className?: string;
  pool: Pool;
  //   amount: number;
  //   token: Token;
  //   onChangeAmount?(amount: number): void;
  //   onSelectToken?(token: Token): void;
}

export default function LiquidityCard(props: Props) {
  const [payToken, setPayToken] = useState(Token.SOL);
  const [payAmount, setPayAmount] = useState(0);

  const { wallet, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  let tokenList = Object.keys(props.pool?.tokens).map((token) => {
    return tokenAddressToToken(token);
  });

  async function addLiq() {
    let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

    let amount = new BN(1 * LAMPORTS_PER_SOL);

    let transferAuthority = findProgramAddressSync(
      ["transfer_authority"],
      perpetual_program.programId
    )[0];

    let perpetuals = findProgramAddressSync(
      ["perpetuals"],
      perpetual_program.programId
    )[0];

    let lpTokenMint = props.pool.lpTokenMint;

    let poolAddress = props.pool.poolAddress;

    let lpTokenAccount = await getAssociatedTokenAddress(
      lpTokenMint,
      publicKey
    );

    let fundingAccount = await getAssociatedTokenAddress(
      new PublicKey(getTokenAddress(payToken)),
      publicKey
    );

    let custody = props.pool.tokens[getTokenAddress(payToken)]?.custodyAccount;
    let custodyOracleAccount =
      props.pool.tokens[getTokenAddress(payToken)]?.oracleAccount;
    let custodyTokenAccount =
      props.pool.tokens[getTokenAddress(payToken)]?.tokenAccount;

    let transaction = new Transaction();
    console.log("funding acc", fundingAccount.toString());

    let custodyMetas = [];
    custodyMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: custody,
    });

    custodyMetas.push({
      isSigner: false,
      isWritable: false,
      pubkey: custodyOracleAccount,
    });

    try {
      if (!(await checkIfAccountExists(lpTokenAccount, connection))) {
        let voucher_wallet_tx = createAssociatedTokenAccountInstruction(
          publicKey,
          lpTokenAccount,
          publicKey,
          lpTokenMint
        );
        transaction = transaction.add(voucher_wallet_tx);
      } else {
        console.log("user voucher already created");
      }

      let addLiquidityTx = await perpetual_program.methods
        .addLiquidity({ amount })
        .accounts({
          owner: publicKey,
          fundingAccount, // user token account for custody token account
          lpTokenAccount,
          transferAuthority,
          perpetuals,
          pool: poolAddress,
          custody,
          custodyOracleAccount,
          custodyTokenAccount,
          lpTokenMint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .remainingAccounts(custodyMetas)
        .transaction();

      transaction = transaction.add(addLiquidityTx);
      console.log("add liquidity tx", transaction);

      await manualSendTransaction(
        transaction,
        publicKey,
        connection,
        signTransaction
      );
    } catch (err) {
      console.log(err);
      throw err;
    }

    // router.reload(window.location.pathname);
  }

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
        tokenList={tokenList}
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

      <SolidButton className="mt-6 w-full" onClick={addLiq}>
        Confirm
      </SolidButton>
    </div>
  );
}
