import "../../public/style.css";
import "../../public/nprogress.css";
import "react-toastify/dist/ReactToastify.min.css";

import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { NextPage } from "next";
import withApollo, { WithApolloProps } from "next-with-apollo";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import { ToastContainer } from "react-toastify";

import { ApolloProvider } from "@apollo/react-hooks";
import { theme, ThemeProvider } from "@chakra-ui/core";

import { GRAPHQL_URL } from "../../shared/constants";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const App: NextPage<AppProps & WithApolloProps<NormalizedCacheObject>> = ({
  Component,
  pageProps,
  apollo,
}) => {
  return (
    <ApolloProvider client={apollo}>
      <Head>
        <title>TrAC</title>
      </Head>

      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
      <ToastContainer toastClassName="toast" />
    </ApolloProvider>
  );
};

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    link: new HttpLink({
      uri: GRAPHQL_URL,
      includeExtensions: true,
      credentials: "same-origin",
    }),
    cache: new InMemoryCache({}).restore(initialState || {}),
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
})(App);
