import { Pool } from "@/hooks/usePools";
import { getTokenAddress } from "@/lib/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { manualSendTransaction } from "@/utils/manualTransaction";
import { checkIfAccountExists } from "@/utils/retrieveData";
import { BN, Wallet } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

export async function addLiquidity(
  pool: Pool,
  wallet: Wallet,
  publicKey: PublicKey,
  signTransaction,
  connection: Connection,
  payToken: Token,
  amount: number
) {
  let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

  let tempAmount = new BN(1 * LAMPORTS_PER_SOL);

  let transferAuthority = findProgramAddressSync(
    ["transfer_authority"],
    perpetual_program.programId
  )[0];

  let perpetuals = findProgramAddressSync(
    ["perpetuals"],
    perpetual_program.programId
  )[0];

  let lpTokenMint = pool.lpTokenMint;

  let poolAddress = pool.poolAddress;

  let lpTokenAccount = await getAssociatedTokenAddress(lpTokenMint, publicKey);

  let fundingAccount = await getAssociatedTokenAddress(
    pool.tokens[getTokenAddress(payToken)]?.tokenMint,
    publicKey
  );

  let custody = pool.tokens[getTokenAddress(payToken)]?.custodyAccount;
  let custodyOracleAccount =
    pool.tokens[getTokenAddress(payToken)]?.oracleAccount;
  let custodyTokenAccount =
    pool.tokens[getTokenAddress(payToken)]?.tokenAccount;

  let transaction = new Transaction();
  console.log("funding acc", fundingAccount.toString());

  let keypair1 = Keypair.generate();
  let keypair2 = Keypair.generate();

  let custodyMetas = [];
  custodyMetas.push({
    isSigner: false,
    isWritable: false,
    pubkey: keypair1.publicKey,
  });

  custodyMetas.push({
    isSigner: false,
    isWritable: false,
    pubkey: keypair2.publicKey,
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
      .addLiquidity({ tempAmount })
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
    console.log("tx keys");
    for (let i = 0; i < transaction.instructions[0].keys.length; i++) {
      console.log(
        "key",
        i,
        transaction.instructions[0].keys[i]?.pubkey.toString()
      );
    }

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
