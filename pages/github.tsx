import gql from "graphql-tag";
import { NextPage } from "next";
import { useContext, useEffect } from "react";

import { useLazyQuery } from "@apollo/react-hooks";

import { AuthContext } from "../src/client/Components/Auth/Context";

const GitHub: NextPage = () => {
  const { user, loading: userLoading } = useContext(AuthContext);

  const [fetchAPI, { loading, data, called }] = useLazyQuery(
    gql`
      query {
        userData {
          id
          name
        }
        userRepos {
          nameWithOwner
        }
      }
    `,
    {}
  );

  useEffect(() => {
    if (user && user.accessToken) {
      fetchAPI();
    }
  }, [user]);

  return userLoading || !(user && user.accessToken) ? (
    <div>Loading User...</div>
  ) : user ? (
    loading || !called ? (
      <div>Loading Query...</div>
    ) : (
      <div>{JSON.stringify(data)}</div>
    )
  ) : (
    <div>Not allowed</div>
  );
};

export default GitHub;
