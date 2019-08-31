import ApolloClient from "apollo-boost";
import App from "next/app";
import { ApolloProvider } from "react-apollo";

import { Auth } from "../src/client/Components/Auth/Context";
import { withApollo } from "../src/client/utils";

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Auth>
          <Component {...pageProps} />
        </Auth>
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
