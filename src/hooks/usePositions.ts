import { useEffect, useState } from "react";

import { Token } from "@/lib/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { Position, PositionPool } from "@/lib/Position";
import { Wallet } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

interface Pending {
  status: "pending";
}

interface Failure {
  status: "failure";
  error: Error;
}

interface Success {
  status: "success";
  data: PositionPool[];
}

type Positions = Pending | Failure | Success;

/**
 * Placeholder method to grab current list of positions
 */
// async function fetchPositions(): Promise<Success> {
//   return {
//     status: "success",
//     data: [
//       {
//         id: "1",
//         name: "Test pool 1",
//         tokens: [Token.SOL, Token.Bonk],
//         positions: [
//           {
//             id: "1",
//             collateral: 90.19,
//             entryPrice: 16.4,
//             leverage: 15,
//             liquidationPrice: 1458.93,
//             liquidationThreshold: 1400.5,
//             markPrice: 1400.5,
//             pnlDelta: 0.16,
//             pnlDeltaPercent: 1.93,
//             size: 1400.5,
//             timestamp: Date.now(),
//             token: Token.SOL,
//             type: "long",
//             value: 15.48,
//             valueDelta: 0.1635,
//             valueDeltaPercentage: 0.99,
//           },
//           {
//             id: "2",
//             collateral: 90.19,
//             entryPrice: 16.4,
//             leverage: 15,
//             liquidationPrice: 1458.93,
//             liquidationThreshold: 1400.5,
//             markPrice: 1400.5,
//             pnlDelta: -0.16,
//             pnlDeltaPercent: -1.93,
//             size: 1400.5,
//             timestamp: Date.now(),
//             token: Token.Bonk,
//             type: "short",
//             value: 15.48,
//             valueDelta: -0.1635,
//             valueDeltaPercentage: -0.99,
//           },
//         ],
//       },
//       {
//         id: "2",
//         name: "Test pool 2",
//         tokens: [Token.mSOL],
//         positions: [
//           {
//             id: "3",
//             collateral: 90.19,
//             entryPrice: 16.4,
//             leverage: 15,
//             liquidationPrice: 1458.93,
//             liquidationThreshold: 1400.5,
//             markPrice: 1400.5,
//             pnlDelta: 0.16,
//             pnlDeltaPercent: 1.93,
//             size: 1400.5,
//             timestamp: Date.now(),
//             token: Token.mSOL,
//             type: "long",
//             value: 15.48,
//             valueDelta: 0.1635,
//             valueDeltaPercentage: 0.99,
//           },
//         ],
//       },
//     ],
//   };
// }

export function usePositions(wallet: Wallet) {
  const [positions, setPositions] = useState<Positions>({ status: "pending" });

  const {  publicKey } = useWallet();

  //           {
  //             id: "1",
  //             collateral: 90.19,
  //             entryPrice: 16.4,
  //             leverage: 15,
  //             liquidationPrice: 1458.93,
  //             liquidationThreshold: 1400.5,
  //             markPrice: 1400.5,
  //             pnlDelta: 0.16,
  //             pnlDeltaPercent: 1.93,
  //             size: 1400.5,
  //             timestamp: Date.now(),
  //             token: Token.SOL,
  //             type: "long",
  //             value: 15.48,
  //             valueDelta: 0.1635,
  //             valueDeltaPercentage: 0.99,
  //           },

  // {
  //       id: "2",
  //       name: "Test pool 2",
  //       tokens: [Token.mSOL],
  //       positions: [
  //         {
  //           id: "3",
  //           collateral: 90.19,
  //           entryPrice: 16.4,
  //           leverage: 15,
  //           liquidationPrice: 1458.93,
  //           liquidationThreshold: 1400.5,
  //           markPrice: 1400.5,
  //           pnlDelta: 0.16,
  //           pnlDeltaPercent: 1.93,
  //           size: 1400.5,
  //           timestamp: Date.now(),
  //           token: Token.mSOL,
  //           type: "long",
  //           value: 15.48,
  //           valueDelta: 0.1635,
  //           valueDeltaPercentage: 0.99,
  //         },
  //       ],
  //     },

  useEffect(() => {
    async function fetchPositions() {
      let { perpetual_program } = await getPerpetualProgramAndProvider(wallet);

      // const owner = new PublicKey('HKU5tpotzMbhABVtnvsrStu5gxZt82q67rWpCUJQf439');
      if(!publicKey){
        return;
      }
      // console.log("owner:",owner.toBase58())

      // perpetual_program.state

      // let fetchedPositions = await perpetual_program.account.position.all(
      //   [{
      //     memcmp: perpetual_program.state?.coder.accounts.memcmp('owner',owner.toBuffer()),
      //     // memcmp : { offset : INVESTOR_MM_DATA.offsetOf('investment_status') , bytes : bs58.encode((new BN(1, 'le')).toArray())}

      //   }]
      // );
      // console.log("perpetual_program.state?.coder.accounts.memcmp('owner',owner.toBuffer()):",perpetual_program.state?.coder.accounts.memcmp('owner',owner.toBuffer()))
      let fetchedPositions = await perpetual_program.account.position.all(
        [{
          memcmp: {
            offset: 8,
            bytes: publicKey.toBase58(),
          },
        }]
      );

      console.log("fetched positons", fetchedPositions);

      // TODO: fix proper token index from pool tokens and need to handle BN , either change the type to have BNs or handle conversion of BN to number here
      // toNumber is bad to use
      let cleanedPositions : Array<Position> = fetchedPositions.map((position, index) => {
        return {
          id: index.toString(),
          positionAccountAddress: position.publicKey.toBase58(),
          collateral: position.account.collateralUsd.toNumber(),

          entryPrice: position.account.openTime.toNumber(),
          leverage: 15,
          liquidationPrice: 1458.93,
          liquidationThreshold: 1400.5,
          markPrice: 1400.5,
          pnlDelta: 0.16,
          pnlDeltaPercent: 1.93,
          size: position.account.sizeUsd.toNumber(),
          timestamp: Date.now(),
          token: Token.SOL,
          type: position.account.side.hasOwnProperty('long') ? 'Long' : 'Short',
          value: 15.48,
          valueDelta: 0.1635,
          valueDeltaPercentage: 0.99,
        };
      });
      const positionsObject : any = {
        status: "success",
        data: [
          {
            id: "1",
            name: "Test pool 1",
            tokens: [Token.SOL],
            positions: cleanedPositions,
          },
        ],
      };
      console.log("positionObject:",positionsObject)
      setPositions(positionsObject);
    }
    fetchPositions();
    // .then(setPositions)
    // .catch((e) =>
    //   setPositions({
    //     status: "failure",
    //     error: e,
    //   })
    // );
  }, [publicKey]);

  return positions;
}
