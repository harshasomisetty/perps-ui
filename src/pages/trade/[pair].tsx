import DailyStats from "@/components/DailyStats";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const { pair } = router.query;

  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [high, setHigh] = useState(0);
  const [low, setLow] = useState(0);

  return (
    <div className="flex flex-row">
      <p>{pair}</p>
      <DailyStats price={price} change={change} high={high} low={low} />
    </div>
  );
}
