import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export enum Side {
    None,
    Long,
    Short,
  }
  
  export interface Position {
     owner: PublicKey,
     pool: PublicKey,
     custody: PublicKey,
     lockCustody: PublicKey,
    
     openTime: BN,
     updateTime: BN,
    
     side: Side,
     price: BN,
     sizeUsd: BN,
     collateralUsd: BN,
     unrealizedProfitUsd: BN,
     unrealizedLossUsd: BN,
     cumulativeInterestSnapshot: BN,
     lockedAmount: BN,
     collateralAmount: BN,
  }
  

  