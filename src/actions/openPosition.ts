import { TokenE } from "@/lib/Token";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN, Wallet } from "@project-serum/anchor";
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
} from "@solana/web3.js";
import { Side, TradeSide } from "@/lib/types";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";

export async function openPosition(
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  pool: PoolAccount,
  payCustody: CustodyAccount,
  positionCustody: CustodyAccount,
  payAmount: BN,
  positionAmount: BN,
  price: BN,
  side: Side
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  // TODO: need to take slippage as param , this is now for testing
  const newPrice =
    side.toString() == "Long"
      ? price.mul(new BN(115)).div(new BN(100))
      : price.mul(new BN(90)).div(new BN(100));

  console.log("pool", pool);

  console.log("position custo", positionCustody.getTokenE());
  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    positionCustody.mint,
    publicKey
  );

  console.log("user custody token account", userCustodyTokenAccount.toString());

  // check if usercustodytoken account exists
  if (!(await checkIfAccountExists(userCustodyTokenAccount, connection))) {
    console.log("user custody token account does not exist");
  }

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

  console.log("pos accoutn", positionAccount.toString());

  let transaction = new Transaction();
  // TODO SWAP IF PAY != POSITION TOKEN

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

        transaction = transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            associatedTokenAccount,
            publicKey,
            NATIVE_MINT
          )
        );
      }

      // get balance of associated token account
      console.log("sol ata exists");
      const balance = await connection.getBalance(associatedTokenAccount);
      if (balance < payAmount.toNumber()) {
        console.log("balance insufficient");
        transaction = transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: associatedTokenAccount,
            lamports: LAMPORTS_PER_SOL,
          }),
          createSyncNativeInstruction(associatedTokenAccount)
        );
      }
    }

    console.log("position account", positionAccount.toString());

    const params: any = {
      price: newPrice,
      collateral: payAmount,
      size: positionAmount,
      side: side.toString() == "Long" ? TradeSide.Long : TradeSide.Short,
    };

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
      .transaction();
    transaction = transaction.add(tx);

    console.log("open pos tx", transaction);
    console.log("tx keys");
    // for (let i = 0; i < transaction.instructions[0]!.keys.length; i++) {
    //   console.log(
    //     "key",
    //     i,
    //     transaction.instructions[0]!.keys[i]?.pubkey.toString()
    //   );
    // }

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
}
