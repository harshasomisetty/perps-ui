import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { CustodyAccount } from "./CustodyAccount";
import { TokenE } from "./Token";
import { Position, Side } from "./types";

export class PositionAccount {
  public owner: PublicKey;
  public pool: PublicKey;
  public custody: PublicKey;
  public lockCustody: PublicKey;

  public openTime: BN;
  public updateTime: BN;

  public side: Side;
  public price: BN;
  public sizeUsd: BN;
  public collateralUsd: BN;
  public unrealizedProfitUsd: BN;
  public unrealizedLossUsd: BN;
  public cumulativeInterestSnapshot: BN;
  public lockedAmount: BN;
  public collateralAmount: BN;

  public token: TokenE;
  public address: PublicKey;

  constructor(
    position: Position,
    address: PublicKey,
    custodies: Record<string, CustodyAccount>
  ) {
    this.owner = position.owner;
    this.pool = position.pool;
    this.custody = position.custody;
    this.lockCustody = position.lockCustody;

    this.openTime = position.openTime;
    this.updateTime = position.updateTime;

    (this.side = position.side.hasOwnProperty("long") ? Side.Long : Side.Short),
      (this.price = position.price);
    this.sizeUsd = position.sizeUsd;
    this.collateralUsd = position.collateralUsd;
    this.unrealizedProfitUsd = position.unrealizedProfitUsd;
    this.unrealizedLossUsd = position.unrealizedLossUsd;
    this.cumulativeInterestSnapshot = position.cumulativeInterestSnapshot;
    this.lockedAmount = position.lockedAmount;
    this.collateralAmount = position.collateralAmount;

    this.token = custodies[this.custody.toString()]?.getTokenE()!;
    this.address = address;
  }

  getLeverage(): number {
    return this.sizeUsd.toNumber() / this.collateralUsd.toNumber();
  }

  getTimestamp(): number {
    return Math.floor(Number(this.openTime) / 1000);
  }
}