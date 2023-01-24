import { useRouter } from "next/router";

import { SidebarLayout } from "@/components/SidebarLayout";
import { CandlestickChart } from "@/components/CandlestickChart";
import { TradeSidebar } from "@/components/TradeSidebar";
import { Token, asToken } from "@/lib/Token";
import { Positions } from "@/components/Positions";

function getToken(pair: string) {
  const [token, _] = pair.split("-");
  return asToken(token || "");
}

function getComparisonCurrency(pair: string) {
  return "usd" as const;
}

export default function Page() {
  const router = useRouter();
  const { pair } = router.query;

  if (!pair) {
    return <></>;
  }

  let token: ReturnType<typeof getToken> = getTokenGivenString(
    pair.split("-")[0]
  );
  // let token = Token.SOL;
  let currency: ReturnType<typeof getComparisonCurrency> =
    getComparisonCurrency(pair);

  if (pair && Array.isArray(pair)) {
    const tokenAndCurrency = pair[0];

    if (tokenAndCurrency) {
      token = getToken(tokenAndCurrency);
      currency = getComparisonCurrency(tokenAndCurrency);
    }
  }

  // TOOD eur is not supported through token type
  // TODO figure out how to reconcile usdc and usd pairs
  return (
    <SidebarLayout className="pt-11">
      <div>
        <TradeSidebar inputPayToken={token} outputPayToken={currency} />
      </div>
      <div>
        <CandlestickChart comparisonCurrency={currency} token={token} />
        <Positions className="mt-8" />
      </div>
    </SidebarLayout>
  );
}
