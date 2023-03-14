import { CustodyAccount } from "@/lib/CustodyAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import {
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  TRANSFER_AUTHORITY,
} from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { BN, Wallet } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

export async function closePosition(
  pool: PoolAccount,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction: SignerWalletAdapterProps["signAllTransactions"],
  connection: Connection,
  position: PositionAccount,
  custody: CustodyAccount,
  price: BN
) {
  console.log("in close postion");
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  console.log("pool", pool);
  console.log("side:", position.side);

  // TODO: need to take slippage as param , this is now for testing
  console.log("side", position.side.toString());
  const adjustedPrice =
    position.side.toString() == "Long"
      ? price.mul(new BN(50)).div(new BN(100))
      : price.mul(new BN(150)).div(new BN(100));
  console.log(
    "price, adjustedPrice, apiPrice:",
    price.toString(),
    adjustedPrice.toString()
  );

  let userCustodyTokenAccount = await getAssociatedTokenAddress(
    custody.mint,
    publicKey
  );

  let transaction = new Transaction();

  try {
    // console.log("position account", positionAccount.toString());

    let tx = await perpetual_program.methods
      .closePosition({
        price: adjustedPrice,
      })
      .accounts({
        owner: publicKey,
        receivingAccount: userCustodyTokenAccount,
        transferAuthority: TRANSFER_AUTHORITY,
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
        position: position.address,
        custody: custody.address,
        custodyOracleAccount: custody.oracle.oracleAccount,
        custodyTokenAccount: custody.tokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();
    transaction = transaction.add(tx);

    console.log("close position tx", transaction);
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
