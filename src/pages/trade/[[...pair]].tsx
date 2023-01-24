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

  let token: ReturnType<typeof getToken> = Token.SOL;
  let currency: ReturnType<typeof getComparisonCurrency> = "usd";

  if (pair && Array.isArray(pair)) {
    const tokenAndCurrency = pair[0];

    if (tokenAndCurrency) {
      token = getToken(tokenAndCurrency);
      currency = getComparisonCurrency(tokenAndCurrency);
    }
  }

  return (
    <SidebarLayout className="pt-11">
      <div>
        <TradeSidebar />
      </div>
      <div>
        <CandlestickChart comparisonCurrency={currency} token={token} />
        <Positions className="mt-8" />
      </div>
    </SidebarLayout>
  );
}
