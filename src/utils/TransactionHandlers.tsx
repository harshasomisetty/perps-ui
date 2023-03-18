import { MethodsBuilder } from "@project-serum/anchor/dist/cjs/program/namespace/methods";
import { toast } from "react-toastify";
import { Connection, TransactionSignature } from "@solana/web3.js";

export const TRX_URL = (txid: string) =>
  `https://explorer.solana.com/tx/${txid}?cluster=devnet`;

export const ACCOUNT_URL = (address: string) =>
  `https://explorer.solana.com/address/${address}?cluster=devnet`;

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

export async function automaticSendTransaction(
  methodBuilder: MethodsBuilder,
  connection: Connection
) {
  let successMessage = "Transaction success!";
  let failMessage = "Transaction Failed";

  await sendAnchorTransactionAndNotify({
    methodBuilder,
    connection,
    successMessage,
    failMessage,
  });
}

export async function sendAnchorTransactionAndNotify({
  methodBuilder,
  connection,
  successMessage,
  failMessage,
}: {
  methodBuilder: MethodsBuilder;
  connection: Connection;
  successMessage: string;
  failMessage: string;
}) {
  let txid = await methodBuilder.rpc();

  await new Promise(function (resolve, reject) {
    toast.promise(
      (async () => {
        try {
          await connection.confirmTransaction(txid, "confirmed");
          console.log(
            `XEN:: - TRX :: https://explorer.solana.com/tx/${txid}?cluster=devnet`
          );
          resolve(true);
        } catch (error) {
          reject(error);
          throw error;
        }
      })(),
      {
        pending: {
          render() {
            return (
              <div className="processing-transaction">
                <div>
                  <h2>Processing transaction {`  `}</h2>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${TRX_URL(txid)}`}
                    className="text-blue-500"
                  >
                    {" "}
                    View on explorer
                  </a>
                </div>
              </div>
            );
          },
        },
        success: {
          render({ data }) {
            return (
              <div className="processing-transaction">
                <div>
                  <span className="icon green">
                    <span
                      className="iconify"
                      data-icon="teenyicons:tick-circle-solid"
                    ></span>
                  </span>
                </div>
                <div>
                  <h2>{successMessage}</h2>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${TRX_URL(txid)}`}
                    className="text-blue-500"
                  >
                    {" "}
                    View on explorer
                  </a>
                </div>
              </div>
            );
          },
          icon: false,
        },
        error: {
          render({ data }) {
            // When the promise reject, data will contains the error
            return (
              <div className="processing-transaction">
                <div>
                  <span className="icon red">
                    <span
                      className="iconify"
                      data-icon="akar-icons:circle-x-fill"
                    ></span>
                  </span>
                </div>
                <div>
                  <h2>
                    {JSON.stringify(data?.message ?? {}).includes("timed")
                      ? data.message
                      : failMessage}
                  </h2>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${TRX_URL(txid)}`}
                    className="text-blue-500"
                  >
                    {" "}
                    View on explorer
                  </a>
                </div>
              </div>
            );
          },
          icon: false,
        },
      }
    );
  });

  return txid;
}
