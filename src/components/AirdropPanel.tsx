import { Pool } from "@/lib/Pool";
import { getTokenAddress, tokenAddressToToken } from "@/lib/Token";
import { PublicKey } from "@solana/web3.js";
import AirdropButton from "./AirdropButton";

interface Props {
  pool: Pool;
}

export default function AirdropPanel(props: Props) {
  let tokenList = Object.keys(props.pool?.tokens).map((token) => {
    return tokenAddressToToken(token);
  });

  return (
    <div className="flex w-full flex-col">
      {tokenList.map((token, key) => (
        <AirdropButton key={key} mint={getTokenAddress(token)} />
      ))}
    </div>
  );
}
