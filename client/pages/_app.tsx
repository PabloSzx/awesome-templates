import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { BatchHttpLink } from "apollo-link-batch-http";
import { NextPage } from "next";
import withApollo, { WithApolloProps } from "next-with-apollo";
import { AppProps } from "next/app";
import Head from "next/head";
import Router from "next/router";
import NProgress from "nprogress";
import React from "react";
import { ToastContainer } from "react-toastify";

import { ApolloProvider } from "@apollo/react-hooks";
import { theme, ThemeProvider } from "@chakra-ui/core";

import { GRAPHQL_URL } from "../consts";
import { Auth } from "../src/Components/Auth/Context";
import Navigation from "../src/Components/Navigation";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

declare module "next" {
  export interface NextPageContext {
    apolloClient: ApolloClient<NormalizedCacheObject>;
  }
}

const NextApp: NextPage<AppProps & WithApolloProps<NormalizedCacheObject>> = ({
  Component,
  pageProps,
  apollo,
}) => {
  return (
    <ApolloProvider client={apollo}>
      <Head>
        <title>Awesome Templates</title>
      </Head>

      <ThemeProvider theme={theme}>
        <Auth>
          <Navigation />
          <Component {...pageProps} />
        </Auth>
      </ThemeProvider>
      <ToastContainer toastClassName="toast" />
    </ApolloProvider>
  );
};

export default withApollo(({ initialState }) => {
  return new ApolloClient({
    link: new BatchHttpLink({
      uri: GRAPHQL_URL,
      includeExtensions: true,
      credentials: "same-origin",
      batchInterval: 50,
    }),
    cache: new InMemoryCache({}).restore(initialState || {}),
    connectToDevTools: process.env.NODE_ENV !== "production",
  });
})(NextApp);
