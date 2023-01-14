import React, { useEffect } from "react";
import Router from "next/router";

const IndexPage = () => {
  useEffect(() => {
    const { pathname } = Router;
    if (pathname == "/") {
      Router.push("/home");
    }
  });

  return <></>;
};

export default IndexPage;
