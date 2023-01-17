import DailyStats from "@/components/DailyStats";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import PlaceOrder from "@/components/PlaceOrder";
import TradingViewWidget from "react-tradingview-widget";

export default function Page() {
  const router = useRouter();
  const { pair } = router.query;

  let pairNames = { SOL: "solana" };

  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [high, setHigh] = useState(0);
  const [low, setLow] = useState(0);

  // TODO - get price highs and lows
  const getPriceData = async () => {
    console.log("pair", pair);

    let names = pair.split("-");
    console.log("names", names);
    console.log("pairNames", pairNames[names[0]]);

    let resp = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=" +
        pairNames[names[0]] +
        "&vs_currencies=" +
        names[1] +
        "&include_24hr_vol=true&include_24hr_change=true"
    );
    let data = resp.data[Object.keys(resp.data)[0]];
    console.log("data", data);
    setPrice(data.usd);
    setChange(data.usd_24h_change.toFixed(2));
  };

  useEffect(() => {
    if (pair && price == 0) {
      console.log("pair", pair);
      getPriceData();
    }
  }, [pair]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <p>{pair}</p>
          <DailyStats price={price} change={change} high={high} low={low} />
        </div>
        <div className="w-min">
          <p>chart</p>

          <TradingViewWidget symbol="SOLUSD" />
        </div>
        <div>Positions</div>
      </div>
      <PlaceOrder />
    </div>
  );
}
