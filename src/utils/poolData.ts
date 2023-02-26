import { PoolObj } from "@/lib/Pool"

export const getPoolData = () => {

}


// this.poolAddress = pool.poolAddress;
// this.lpTokenMint = pool.lpTokenMint;
// this.tokens = pool.tokens;
// this.tokenNames = pool.tokenNames;
// this.custodyMetas = pool.custodyMetas;
// this.lpDecimals = pool.lpDecimals;

const pools : PoolObj = [
    {
        poolName : 'tp2',
        poolAddress : '2bsToqS2DcziiyMHGf9qxLu2ks7HEF6FZiCpRZqeC3KM',
        tokens : [],
        tokenNames : [],
        // custodyMetas : [],
        lpDecimals : 6,
        lpTokenMint : 'BycanFS7yaWvJ488YZvJR3fufNfyXhJ8zEmQzHBkv52U'
    },
    {
        poolName : 'internal_test',
        poolAddress : 'DXdPxx7mS1EtCPcEm2uoLioYdXoE2HoVrHaR4o8Kg2uh',
        tokens : ['6QGdQbaZEgpXqqbGwXJZXwbZ9xJnthfyYNZ92ARzTdAX', 'So11111111111111111111111111111111111111112'],
        tokenNames : ['Test', 'SOL'],
        // custodyMetas : [],
        lpDecimals : 6,
        lpTokenMint : 'J1887XKSeZFRzD6ACyiWMurXZd8xtNyb1Edj2oAxKT9E'
    },
    {
        poolName : 'TestPool1',
        poolAddress : 'GSa3BkjXpoUdd1Bw1EiuMLRY3jFZBwQJJivPNWgSiGJ3',
        tokens : [ 'So11111111111111111111111111111111111111112','Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'],
        tokenNames : ['SOL', 'USDC'],
        // custodyMetas : [],
        lpDecimals : 6,
        lpTokenMint : 'Han23mxQeHeoBbj4vYtYZNaB5bhwV3n4nxKezM6H6nbr'
    }
]