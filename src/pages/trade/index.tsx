import React, { useEffect } from "react";
import Router from "next/router";
import Link from "next/link";

export default function Page() {
  // useEffect(() => {
  //   const { pathname } = Router;
  //   if (pathname == "/trade") {
  //     Router.push("/trade/SOLUSD");
  //   }
  // });

  return (
    <>
      <p>trade page</p>
      <Link href="/trade/SOL-USD">SOL-USD</Link>
    </>
  );
}
