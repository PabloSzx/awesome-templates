import Head from "next/head";
import { useContext } from "react";

import { AuthContext } from "../src/client/Components/Auth/Context";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <Head>
        <title>Awesome Templates</title>
      </Head>

      <h1>Awesome Templates</h1>

      {user && <h1>Welcome {user.data.login}</h1>}
    </div>
  );
};

export default Home;
