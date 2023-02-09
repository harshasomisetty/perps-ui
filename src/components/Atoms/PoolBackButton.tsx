import { ChevronLeft } from "@carbon/icons-react";
import { useRouter } from "next/router";

export default function PoolBackButton() {
  const router = useRouter();

  return (
    <div
      className="flex cursor-pointer flex-row align-bottom"
      onClick={() => router.push("/pools")}
    >
      <ChevronLeft className="h-8 w-8" />

      <p className="text-zinc-400">Back To Pools</p>
    </div>
  );
}
