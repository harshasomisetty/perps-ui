import { Cluster, PublicKey } from '@solana/web3.js';
import { CLUSTER } from './constants';
import poolConfigs from './PoolConfig.json';

export class PoolConfig {
  constructor(
    public cluster: Cluster,
    public poolName: string,
    public poolAddress: PublicKey,
    public lpTokenMint: PublicKey,
    // public perpMarketAccountKey: string,
    // public multisigAccountKey: string,
    // public transferAuthorityAccountKey: string,

    public tokens: {
      symbol: string;
      mintKey: PublicKey;
      decimals: number;
      isStable: boolean;
    }[],

    public custodies: {
      custodyAccount: PublicKey;
      tokenAccount: PublicKey;
      symbol: string;
      mintKey: PublicKey;
      decimals: number;
      isStable: boolean,
      oracleAddress: PublicKey;
    }[],
  ) { }

  public getAllTokenMints(): PublicKey[] {
    return Array.from(
      this.tokens.map((token) => new PublicKey(token.mintKey)),
    );
  }

  public getNonStableTokens(): PublicKey[] {
    return Array.from(
      this.tokens
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

  static getAllPoolConfigs(): PoolConfig[] {
    return poolConfigs.pools.map(p => this.fromIdsByName(p.poolName, CLUSTER))
  }

  static fromIdsByName(name: string, cluster: Cluster): PoolConfig {
    const poolConfig = poolConfigs.pools.find((pool) => pool['poolName'] === name && cluster === pool['cluster']);
    if (!poolConfig) throw new Error(`No pool config ${name} found in Ids!`);
    const tokens = poolConfig['tokens'].map(i => {
      return {
        ...i,
        mintKey : new PublicKey(i.mintKey)
      }
    })
    const custodies = poolConfig['custodies'].map(i => {
      return {
        ...i,
        custodyAccount : new PublicKey(i.custodyAccount),
        tokenAccount : new PublicKey(i.tokenAccount),
        mintKey : new PublicKey(i.mintKey),
        oracleAddress : new PublicKey(i.oracleAddress),
      }
    })
    return new PoolConfig(
      poolConfig.cluster as Cluster,
      poolConfig.poolName,
      new PublicKey(poolConfig.poolAddress),
      new PublicKey(poolConfig.lpTokenMint),
      tokens,
      custodies,
    );
  }

  static fromIdsByPk(poolPk: PublicKey, cluster: Cluster): PoolConfig {
    const poolConfig = poolConfigs.pools.find(
      (pool) => pool['poolAddress'] === poolPk.toString() && cluster === pool['cluster'],
    );
    if (!poolConfig)
      throw new Error(`No pool config ${poolPk.toString()} found in Ids!`);

      const tokens = poolConfig['tokens'].map(i => {
        return {
          ...i,
          mintKey : new PublicKey(i.mintKey)
        }
      })
      const custodies = poolConfig['custodies'].map(i => {
        return {
          ...i,
          custodyAccount : new PublicKey(i.custodyAccount),
          tokenAccount : new PublicKey(i.tokenAccount),
          mintKey : new PublicKey(i.mintKey),
          oracleAddress : new PublicKey(i.oracleAddress),
        }
      })

    return new PoolConfig(
      poolConfig.cluster as Cluster,
      poolConfig.poolName,
      new PublicKey(poolConfig.poolAddress),
      new PublicKey(poolConfig.lpTokenMint),
      tokens,
      custodies,
    );
  }

}
