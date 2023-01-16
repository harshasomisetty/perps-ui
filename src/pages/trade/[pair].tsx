import Router, { useRouter } from "next/router";
import React, { useEffect } from "react";

export default function Page() {
  const router = useRouter();

  const { pair } = router.query;
  //   console.log("pair", pair);
  //   console.log("pathname", router.pathname);

  return (
    <div>
      <p>pair {pair} </p>
    </div>
  );
}
