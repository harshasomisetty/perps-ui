export interface Custody {
    pool:             string;
    mint:             string;
    tokenAccount:     string;
    decimals:         number;
    isStable:         boolean;
    oracle:           Oracle;
    pricing:          Pricing;
    permissions:      Permissions;
    fees:             Fees;
    borrowRate:       string;
    borrowRateSum:    string;
    assets:           Assets;
    collectedFees:    CollectedFees;
    volumeStats:      CollectedFees;
    tradeStats:       TradeStats;
    bump:             number;
    tokenAccountBump: number;
}

export interface Assets {
    collateral:   string;
    protocolFees: string;
    owned:        string;
    locked:       string;
}

export interface CollectedFees {
    swapUsd:            string;
    addLiquidityUsd:    string;
    removeLiquidityUsd: string;
    openPositionUsd:    string;
    closePositionUsd:   string;
    liquidationUsd:     string;
}

export interface Fees {
    mode:            Mode;
    maxIncrease:     string;
    maxDecrease:     string;
    swap:            string;
    addLiquidity:    string;
    removeLiquidity: string;
    openPosition:    string;
    closePosition:   string;
    liquidation:     string;
    protocolShare:   string;
}

export interface Mode {
    linear: Linear;
}

export interface Linear {
}

export interface Oracle {
    oracleAccount:  string;
    oracleType:     OracleType;
    maxPriceError:  string;
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
    tradeSpreadLong:    string;
    tradeSpreadShort:   string;
    swapSpread:         string;
    minInitialLeverage: string;
    maxLeverage:        string;
    maxPayoffMult:      string;
}

export interface TradeStats {
    profitUsd:  string;
    lossUsd:    string;
    oiLongUsd:  string;
    oiShortUsd: string;
}