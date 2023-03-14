import {
  DEFAULT_PERPS_USER,
  getPerpetualProgramAndProvider,
  PERPETUALS_ADDRESS,
  PERPETUALS_PROGRAM_ID,
} from "@/utils/constants";
import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import {
  Connection,
  PublicKey,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
  Transaction,
} from "@solana/web3.js";
import { IDL, Perpetuals } from "@/target/types/perpetuals";
import { decode } from "@project-serum/anchor/dist/cjs/utils/bytes/base64";
import { IdlCoder } from "@/utils/IdlCoder";
import { CustodyAccount } from "@/lib/CustodyAccount";
import { PositionAccount } from "@/lib/PositionAccount";
import { PoolAccount } from "@/lib/PoolAccount";
import { Side } from "@/lib/types";

export type PositionSide = "long" | "short";

export interface PriceAndFee {
  liquidationPrice: BN;
  entryPrice: BN;
  fee: BN;
}

export interface ProfitAndLoss {
  profit: BN;
  loss: BN;
}

export interface SwapAmountAndFees {
  amountOut: BN;
  feeIn: BN;
  feeOut: BN;
}

export class ViewHelper {
  program: Program<Perpetuals>;
  connection: Connection;
  provider: AnchorProvider;
  //   poolConfig: PoolConfig;

  constructor(connection: Connection, provider: AnchorProvider) {
    this.connection = connection;
    this.provider = provider;
    this.program = new Program(IDL, PERPETUALS_PROGRAM_ID, provider);
    // this.poolConfig = PoolConfig.fromIdsByName(DEFAULT_POOL, CLUSTER);
  }

  // may need to add blockhash and also probably use VersionedTransactions
  simulateTransaction = async (
    transaction: Transaction
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> => {
    transaction.feePayer = DEFAULT_PERPS_USER.publicKey;
    return this.connection.simulateTransaction(transaction);
  };

  decodeLogs<T>(
    data: RpcResponseAndContext<SimulatedTransactionResponse>,
    instructionNumber: number
  ): T {
    const returnPrefix = `Program return: ${PERPETUALS_PROGRAM_ID} `;
    // console.log("Data:", data);
    if (data.value.logs && data.value.err === null) {
      let returnLog = data.value.logs.find((l: any) =>
        l.startsWith(returnPrefix)
      );
      if (!returnLog) {
        throw new Error("View expected return log");
      }
      let returnData = decode(returnLog.slice(returnPrefix.length));
      // @ts-ignore
      let returnType = IDL.instructions[instructionNumber].returns;

      if (!returnType) {
        throw new Error("View expected return type");
      }
      const coder = IdlCoder.fieldLayout(
        { type: returnType },
        Array.from([...(IDL.accounts ?? []), ...(IDL.types ?? [])])
      );
      // return coder.decode(returnData);
      // console.log("coder.decode(returnData); ::: ", coder.decode(returnData));
      return coder.decode(returnData);
    } else {
      throw new Error(`No Logs Found `, { cause: data });
    }
  }

  getAssetsUnderManagement = async (pool: PoolAccount): Promise<BN> => {
    let program = new Program(IDL, PERPETUALS_PROGRAM_ID, this.provider);

    const transaction = await program.methods
      // @ts-ignore
      .getAssetsUnderManagement({})
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
      })
      .remainingAccounts(pool.getCustodyMetas())
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getAssetsUnderManagement"
    );
    return this.decodeLogs(result, index);
  };

  getEntryPriceAndFee = async (
    collateral: BN,
    size: BN,
    side: Side,
    pool: PoolAccount,
    custody: CustodyAccount
  ): Promise<PriceAndFee> => {
    let program = new Program(IDL, PERPETUALS_PROGRAM_ID, this.provider);
    // console.log("fee payer : ", DEFAULT_PERPS_USER.publicKey.toBase58());
    // console.log("side", side);

    let transaction: Transaction = await program.methods
      // @ts-ignore
      .getEntryPriceAndFee({
        collateral,
        size,
        side: side === "Long" ? { long: {} } : { short: {} },
      })
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
        custody: custody.address,
        custodyOracleAccount: custody.oracle.oracleAccount,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    // console.log("got entry result", result);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getEntryPriceAndFee"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      liquidationPrice: res.liquidationPrice,
      entryPrice: res.entryPrice,
      fee: res.fee,
    };
  };

  getExitPriceAndFee = async (position: PublicKey): Promise<PriceAndFee> => {
    let program = new Program(IDL, PERPETUALS_PROGRAM_ID, this.provider);
    // console.log("fee payer : ", DEFAULT_PERPS_USER.publicKey.toBase58());

    const transaction = await program.methods
      // @ts-ignore
      .getExitPriceAndFee({})
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: position.pool,
        position: position.address,
        custody: position.custody,
        custodyOracleAccount: position.oracleAccount,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getExitPriceAndFee"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      price: res.price,
      fee: res.fee,
    };
  };

  getLiquidationPrice = async (position: PositionAccount): Promise<BN> => {
    let program = new Program(IDL, PERPETUALS_PROGRAM_ID, this.provider);

    // console.log("fee payer : ", DEFAULT_PERPS_USER.publicKey.toBase58());
    const transaction = await program.methods
      // @ts-ignore
      .getLiquidationPrice({})
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: position.pool,
        position: position.address,
        custody: position.custody,
        custodyOracleAccount: position.oracleAccount,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getLiquidationPrice"
    );
    return this.decodeLogs(result, index);
  };

  getLiquidationState = async (position: PositionAccount): Promise<BN> => {
    let program = new Program(IDL, PERPETUALS_PROGRAM_ID, this.provider);

    const transaction = await program.methods
      // @ts-ignore
      .getLiquidationState({})
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: position.pool,
        position: position.address,
        custody: position.custody,
        custodyOracleAccount: position.oracleAccount,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getLiquidationState"
    );
    return this.decodeLogs(result, index);
  };

  // getAddLiquidity = async (pool:

  //   getOraclePrice = async (
  //     poolKey: PublicKey,
  //     ema: boolean,
  //     custodyKey: PublicKey
  //   ): Promise<BN> => {
  //     const transaction = await this.program.methods
  //       .getOraclePrice({
  //         ema,
  //       })
  //       .accounts({
  //         perpetuals: this.poolConfig.perpetuals,
  //         pool: poolKey,
  //         custody: custodyKey,
  //         custodyOracleAccount:
  //           PoolConfig.getCustodyConfig(custodyKey)?.oracleAddress,
  //       })
  //       .transaction();

  //     const result = await this.simulateTransaction(transaction);
  //     const index = IDL.instructions.findIndex(
  //       (f) => f.name === "getOraclePrice"
  //     );
  //     return this.decodeLogs<BN>(result, index);
  //   };

  getPnl = async (position: PositionAccount): Promise<ProfitAndLoss> => {
    let { perpetual_program } = await getPerpetualProgramAndProvider();
    const transaction = await perpetual_program.methods
      .getPnl({})
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: position.pool,
        position: position.address,
        custody: position.custody,
        custodyOracleAccount: position.oracleAccount,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex((f) => f.name === "getPnl");
    const res: any = this.decodeLogs<BN>(result, index);
    return {
      profit: res.profit,
      loss: res.loss,
    };
  };

  getSwapAmountAndFees = async (
    amountIn: BN,
    pool: PoolAccount,
    receivingCustody: CustodyAccount,
    dispensingCustody: CustodyAccount
  ): Promise<SwapAmountAndFees> => {
    let program = new Program(IDL, PERPETUALS_PROGRAM_ID, this.provider);

    let transaction = await program.methods
      // @ts-ignore
      .getSwapAmountAndFees({
        amountIn,
      })
      .accounts({
        perpetuals: PERPETUALS_ADDRESS,
        pool: pool.address,
        receivingCustody: receivingCustody.address,
        receivingCustodyOracleAccount: receivingCustody.oracle.oracleAccount,
        dispensingCustody: dispensingCustody.address,
        dispensingCustodyOracleAccount: dispensingCustody.oracle.oracleAccount,
      })
      .transaction();

    const result = await this.simulateTransaction(transaction);
    const index = IDL.instructions.findIndex(
      (f) => f.name === "getSwapAmountAndFees"
    );
    const res: any = this.decodeLogs(result, index);

    return {
      amountOut: res.amountOut,
      feeIn: res.feeIn,
      feeOut: res.feeOut,
    };
  };
}
