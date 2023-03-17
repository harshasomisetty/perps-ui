import { TokenE } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN, Wallet } from "@project-serum/anchor";
import { Wallet as SolanaWalletReact } from "@solana/wallet-adapter-react";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Side, TradeSide } from "@/lib/types";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";

export async function openPosition(
  wallet: SolanaWalletReact,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signTransaction"],
  signAllTransactions: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  pool: PoolAccount,
  payCustody: CustodyAccount,
  positionCustody: CustodyAccount,
  payAmount: BN,
  positionAmount: BN,
  price: BN,
  side: Side
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(
    wallet,
    signTransaction,
    signAllTransactions
  );

  // TODO: need to take slippage as param , this is now for testing
  const newPrice =
    side.toString() == "Long"
      ? price.mul(new BN(115)).div(new BN(100))
      : price.mul(new BN(90)).div(new BN(100));

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    positionCustody.mint,
    publicKey
  );

  // console.log("tokens", payToken, positionToken);
  let positionAccount = findProgramAddressSync(
    [
      Buffer.from("position"),
      publicKey.toBuffer(),
      pool.address.toBuffer(),
      positionCustody.address.toBuffer(),
      // @ts-ignore
      side.toString() == "Long" ? [1] : [2],
    ],
    perpetual_program.programId
  )[0];

  // let transaction = new Transaction();
  // TODO SWAP IF PAY != POSITION TOKEN

  let assoTx;
  let transferTx;
  let syncTx;

  try {
    // wrap sol if needed
    if (positionCustody.getTokenE() == TokenE.SOL) {
      console.log("pay token name is sol");

      const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        publicKey
      );

      if (!(await checkIfAccountExists(associatedTokenAccount, connection))) {
        console.log("sol ata does not exist", NATIVE_MINT.toString());

        assoTx = createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAccount,
          publicKey,
          NATIVE_MINT
        );
      }

      console.log("sol ata exists");
      const balance = await connection.getBalance(associatedTokenAccount);
      if (balance < payAmount.toNumber()) {
        console.log("balance insufficient");

        transferTx = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: associatedTokenAccount,
          lamports: LAMPORTS_PER_SOL,
        });
        // transaction = transaction.add(
        // SystemProgram.transfer({
        //   fromPubkey: publicKey,
        //   toPubkey: associatedTokenAccount,
        //   lamports: LAMPORTS_PER_SOL,
        // }),
        syncTx = createSyncNativeInstruction(associatedTokenAccount);
        // );
      }
    }

    console.log("position account", positionAccount.toString());

    const params: any = {
      price: newPrice,
      collateral: payAmount,
      size: positionAmount,
      side: side.toString() == "Long" ? TradeSide.Long : TradeSide.Short,
    };

    let preInstructions: TransactionInstruction[] = [];
    if (assoTx) preInstructions.push(assoTx);
    if (transferTx) preInstructions.push(transferTx);
    if (syncTx) preInstructions.push(syncTx);

    console.log("about to rpc transaction");

    console.log(
      "wallet data",
      perpetual_program.provider,
      perpetual_program.provider.publicKey?.toString()
    );
    let tx = await perpetual_program.methods
      .openPosition(params)
      .accounts({
        owner: publicKey,
        fundingAccount: userCustodyTokenAccount,
        transferAuthority: TRANSFER_AUTHORITY,
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
        position: positionAccount,
        custody: positionCustody.address,
        custodyOracleAccount: positionCustody.oracle.oracleAccount,
        custodyTokenAccount: positionCustody.tokenAccount,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .preInstructions(preInstructions)
      .rpc();
    // .transaction();
    // transaction = transaction.add(tx);

    // await manualSendTransaction(
    //   transaction,
    //   publicKey,
    //   connection,
    //   signTransaction
    // );
  } catch (err) {
    console.log(err);
    throw err;
  }
}
