import { useContext } from "react";

import { AuthContext } from "../src/client/Components/Auth/Context";

const Home = () => {
  const { user } = useContext(AuthContext);

  return <div>{user && <h1>Welcome {user.data.login}</h1>}</div>;
};

export default Home;
