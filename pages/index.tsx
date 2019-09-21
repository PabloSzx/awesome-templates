import { useContext } from "react";
import { Grid } from "semantic-ui-react";

import { AuthContext } from "../src/client/Components/Auth/Context";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <Grid centered padded>
      <h1>Welcome to Awesome Templates {user && user.data.login}</h1>
    </Grid>
  );
};

export default Home;
