import gql from "graphql-tag";
import { createContext, FunctionComponent, useEffect, useState } from "react";

import { useQuery } from "@apollo/react-hooks";

type User = {
  _id: string;
  admin: boolean;
  data: {
    avatarUrl: string;
    login: string;
    url: string;
    email: string;
    name?: string;
    bio?: string;
  };
};
export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  loading: true,
} as {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
});

export const Auth: FunctionComponent = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const { data, loading: loadingQuery } = useQuery<{
    current_user: User | null;
  }>(
    gql`
      query {
        current_user {
          _id
          admin
          data {
            avatarUrl
            login
            url
            email
            name
            bio
          }
        }
      }
    `,
    { ssr: false }
  );

  useEffect(() => {
    if (!loadingQuery) setLoading(false);

    if (!loadingQuery && data && data.current_user) setUser(data.current_user);
  }, [loadingQuery, data]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
