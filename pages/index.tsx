import gql from "graphql-tag";
import Head from "next/head";
import Link from "next/link";
import { useContext } from "react";
import { useMutation } from "react-apollo";

import { AuthContext } from "../src/client/Components/Auth/Context";

const Home = () => {
  const { user, setUser } = useContext(AuthContext);
  const [logout] = useMutation<boolean>(gql`
    mutation {
      logout
    }
  `);

  return (
    <div>
      <Head>
        <title>Awesome Templates</title>
      </Head>

      <h1>Awesome Templates</h1>

      {user && <h1>Welcome {user.data.login}</h1>}
      <nav>
        {!user ? (
          <>
            <a href="/api/login/github">
              <button>Login With GitHub</button>
            </a>
          </>
        ) : (
          <>
            {user.admin && (
              <Link href="/admin">
                <button>Admin Dashboard</button>
              </Link>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();

                setUser(null);
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Home;
