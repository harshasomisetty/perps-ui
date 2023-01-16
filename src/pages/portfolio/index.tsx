import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";

export default function Home() {
  const { wallet, publicKey } = useWallet();
  const { connection } = useConnection();
  const [userSol, setUserSol] = useState(0);

  const router = useRouter();

  const { pair } = router.query;
  console.log("pathname", router.pathname);

  useEffect(() => {
    async function fetchData() {
      let uSol = Number(await connection.getBalance(publicKey!));
      setUserSol(uSol);
    }
    if (wallet && publicKey) {
      fetchData();
    }
  }, [wallet, publicKey]);

  return (
    <div>
      <p>Hello</p>
      <p>Sol Balance: {(userSol / LAMPORTS_PER_SOL).toFixed(2)}</p>
    </div>
  );
}
