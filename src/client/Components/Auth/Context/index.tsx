import gql from "graphql-tag";
import { createContext, FunctionComponent, useEffect, useState } from "react";
import { useQuery } from "react-apollo";

type User = {
  id: string;
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
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const { data, loading: queryLoading } = useQuery<{
    current_user: User;
  }>(
    gql`
      query {
        current_user {
          id
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
    if (!queryLoading) setLoading(false);

    if (data && data.current_user) setUser(data.current_user);
  }, [queryLoading, data]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
