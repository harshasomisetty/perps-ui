import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export interface Custody {
    pool:             PublicKey;
    mint:             PublicKey;
    tokenAccount:     PublicKey;
    decimals:         number;
    isStable:         boolean;
    oracle:           Oracle;
    pricing:          Pricing;
    permissions:      Permissions;
    fees:             Fees;
    borrowRate:       BN;
    borrowRateSum:    BN;
    assets:           Assets;
    collectedFees:    CollectedFees;
    volumeStats:      CollectedFees;
    tradeStats:       TradeStats;
    bump:             number;
    tokenAccountBump: number;
}

export interface Assets {
    collateral:   BN;
    protocolFees: BN;
    owned:        BN;
    locked:       BN;
}

export interface CollectedFees {
    swapUsd:            BN;
    addLiquidityUsd:    BN;
    removeLiquidityUsd: BN;
    openPositionUsd:    BN;
    closePositionUsd:   BN;
    liquidationUsd:     BN;
}

export interface Fees {
    mode:            Mode;
    maxIncrease:     BN;
    maxDecrease:     BN;
    swap:            BN;
    addLiquidity:    BN;
    removeLiquidity: BN;
    openPosition:    BN;
    closePosition:   BN;
    liquidation:     BN;
    protocolShare:   BN;
}

export interface Mode {
    linear: Linear;
}

export interface Linear {
}

export interface Oracle {
    oracleAccount:  PublicKey;
    oracleType:     OracleType;
    maxPriceError:  BN;
    maxPriceAgeSec: number;
}

export interface OracleType {
    pyth: Linear;
}

export interface Permissions {
    allowSwap:                 boolean;
    allowAddLiquidity:         boolean;
    allowRemoveLiquidity:      boolean;
    allowOpenPosition:         boolean;
    allowClosePosition:        boolean;
    allowPnlWithdrawal:        boolean;
    allowCollateralWithdrawal: boolean;
    allowSizeChange:           boolean;
}

export interface Pricing {
    useEma:             boolean;
    tradeSpreadLong:    BN;
    tradeSpreadShort:   BN;
    swapSpread:         BN;
    minInitialLeverage: BN;
    maxLeverage:        BN;
    maxPayoffMult:      BN;
}

export interface TradeStats {
    profitUsd:  BN;
    lossUsd:    BN;
    oiLongUsd:  BN;
    oiShortUsd: BN;
}