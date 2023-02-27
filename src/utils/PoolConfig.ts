import { Cluster, PublicKey } from '@solana/web3.js';
import ids from './ids.json';

export class PoolConfig {
  constructor(
    public cluster: Cluster,
    public poolName: string,
    public poolAddress: string,
    public lpTokenMint: string,
    // public perpMarketAccountKey: string,
    // public multisigAccountKey: string,
    // public transferAuthorityAccountKey: string,

    public tokenInfos: { 
      symbol: string;
      mintKey: string;
      decimals: number;
      isStable: boolean;
      }[],

    public custodies: {
      custodyAccount : string;
      tokenAccount : string;
      symbol: string;
      mintKey: string;
      decimals: number;
      isStable : boolean,
      oracleAddress : string;
    }[],
  ) {}

  public getAllTokenMints(): PublicKey[] {
    return Array.from(
      this.tokenInfos.map((token) => new PublicKey(token.mintKey)),
    );
  }

  public getNonStableTokens(): PublicKey[] {
    return Array.from(
      this.tokenInfos
        .filter((token) => !token.isStable)
        .map((token) => new PublicKey(token.mintKey)),
    );
  }
 
  public getAllCustodies(): PublicKey[] {
    return Array.from(
      this.custodies.map((custody) => new PublicKey(custody.custodyAccount)),
    );
  }

  public getNonStableCustodies(): PublicKey[] {
    return Array.from(
      this.custodies
        .filter((custody) => !custody.isStable)
        .map((custody) => new PublicKey(custody.custodyAccount)),
    );
  }

  static fromIdsByName(name: string): PoolConfig {
    const poolConfig = ids.pools.find((id) => id['poolName'] === name);
    if (!poolConfig) throw new Error(`No pool config ${name} found in Ids!`);
    return new PoolConfig(
      poolConfig.cluster as Cluster,
      poolConfig.poolName,
      poolConfig.poolAddress,
      poolConfig.lpTokenMint,
      poolConfig['tokens'],
      poolConfig['custodies'],
    );
  }

  static fromIdsByPk(poolPk: PublicKey): PoolConfig {
    const poolConfig = ids.pools.find(
      (id) => id['poolAddress'] === poolPk.toString(),
    );
    if (!poolConfig)
      throw new Error(`No pool config ${poolPk.toString()} found in Ids!`);
      return new PoolConfig(
        poolConfig.cluster as Cluster,
        poolConfig.poolName,
        poolConfig.poolAddress,
        poolConfig.lpTokenMint,
        poolConfig['tokens'],
        poolConfig['custodies'],
      );
  }

}