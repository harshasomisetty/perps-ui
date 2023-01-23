import { useRouter } from "next/router";

import { SidebarLayout } from "@/components/SidebarLayout";
import { CandlestickChart } from "@/components/CandlestickChart";
import { TradeSidebar } from "@/components/TradeSidebar";
import { getTokenGivenString, Token } from "@/hooks/useDailyPriceStats";

function getToken(pair: string) {
  const [token, _] = pair.split("-");

  if (token && token.toLocaleLowerCase() === "sol") {
    return Token.SOL as const;
  }

  throw new Error("invalid token");
}

function getComparisonCurrency(pair: string) {
  const [_, currency] = pair.split("-");

  if (currency) {
    if (currency.toLocaleLowerCase() === "usd") {
      return Token.USDC;
    }

    if (currency.toLocaleLowerCase() === "eur") {
      return "eur";
    }

    if (currency.toLocaleLowerCase() === "usdc") {
      return Token.USDC;
    }

    if (currency.toLocaleLowerCase() === "usdt") {
      return Token.USDT;
    }
  }

  throw new Error("invalid currency");
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
  return (
    <SidebarLayout className="pt-11">
      <div>
        <TradeSidebar inputPayToken={token} outputPayToken={currency} />
      </div>
      <div>
        <CandlestickChart
          className="h-[350px] md:h-[500px]"
          comparisonCurrency={currency}
          token={token}
        />
      </div>
    </SidebarLayout>
  );
}
