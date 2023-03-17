# Perps UI

Ui demo for [perpetuals exchange](https://www.github.com/askibin/perpetuals)

## Launch script

`solana-keygen new -o ~/.config/solana/perpetuals-address.json`

(get address, replace address in Anchor.toml, program/lib.rs)

`anchor deploy --provider.cluster https://api.devnet.solana.com --program-keypair ~/.config/solana/perpetuals-address.json`

`anchor idl init --filepath target/idl/perpetuals.json <perps_add> --provider.cluster https://api.devnet.solana.com`

Setting up program
`npx ts-node app/src/cli.ts init -k ~/.config/solana/perps-admin.json -m 1 <perps-admin key>`

`npx ts-node app/src/cli.ts -k ~/.config/solana/perps-admin.json add-pool TestPool1`

Sol Token: J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix
Test Token oracle: BLArYBCUYhdWiY8PCUTpvFE21iaJq85dvxLk9bYMobcU
usdc oracle: 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7

TestPool1: Sol & Usdc & Test

```
npx ts-node app/src/cli.ts -k ~/.config/solana/perps-admin.json add-custody TestPool1 So11111111111111111111111111111111111111112 J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix false

npx ts-node app/src/cli.ts -k ~/.config/solana/perps-admin.json add-custody TestPool1 6QGdQbaZEgpXqqbGwXJZXwbZ9xJnthfyYNZ92ARzTdAX BLArYBCUYhdWiY8PCUTpvFE21iaJq85dvxLk9bYMobcU

npx ts-node app/src/cli.ts -k ~/.config/solana/perps-admin.json add-custody TestPool1 Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7
```

TestPool2: Sol & Test

```
npx ts-node app/src/cli.ts -k ~/.config/solana/perps-admin.json add-custody TestPool2 So11111111111111111111111111111111111111112 J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix false

npx ts-node app/src/cli.ts -k ~/.config/solana/perps-admin.json add-custody TestPool2 6QGdQbaZEgpXqqbGwXJZXwbZ9xJnthfyYNZ92ARzTdAX BLArYBCUYhdWiY8PCUTpvFE21iaJq85dvxLk9bYMobcU
```
