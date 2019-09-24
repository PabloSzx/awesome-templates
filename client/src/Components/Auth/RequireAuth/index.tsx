import Router from "next/router";
import { FunctionComponent, useContext, useEffect } from "react";

import Loader from "../../Loader";
import { AuthContext } from "../Context";

export default (({ children }) => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      Router.push("/");
    }
  }, [user, loading]);

  if (loading) {
    return <Loader />;
  }
  if (!user) {
    return <div>Redirecting...</div>;
  }
  return children;
}) as FunctionComponent;
