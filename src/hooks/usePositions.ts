import { useEffect, useState } from "react";

import { Token } from "@/lib/Token";
import { getPerpetualProgramAndProvider } from "@/utils/constants";
import { PositionPool } from "@/lib/Position";

// interface Pending {
//   status: "pending";
// }

// interface Failure {
//   status: "failure";
//   error: Error;
// }

// interface Success {
//   status: "success";
//   data: PositionPool[];
// }

// type Positions = Pending | Failure | Success;

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

export function usePositions(wallet) {
  const [positions, setPositions] = useState<Position>({ status: "pending" });

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

      let fetchedPositions = await perpetual_program.account.position.all();
      console.log("fetched positons", fetchedPositions);

      // TODO: fix proper token index from pool tokens
      let cleanedPositions = fetchedPositions.map((position, index) => {
        return {
          id: index,
          collateral: position.account.collateralUsd,

          entryPrice: 16.4,
          leverage: 15,
          liquidationPrice: 1458.93,
          liquidationThreshold: 1400.5,
          markPrice: 1400.5,
          pnlDelta: 0.16,
          pnlDeltaPercent: 1.93,
          size: position.account.sizeUsd,
          timestamp: Date.now(),
          token: Token.SOL,
          type: position.account.side,
          value: 15.48,
          valueDelta: 0.1635,
          valueDeltaPercentage: 0.99,
        };
      });

      setPositions({
        status: "success",
        data: [
          {
            id: "1",
            name: "Test pool 1",
            tokens: [Token.SOL],
            positions: cleanedPositions,
          },
        ],
      });
    }
    fetchPositions();
    // .then(setPositions)
    // .catch((e) =>
    //   setPositions({
    //     status: "failure",
    //     error: e,
    //   })
    // );
  }, []);

  return positions;
}
