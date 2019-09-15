import { useContext } from "react";
import { Grid } from "semantic-ui-react";

import { AuthContext } from "../src/client/Components/Auth/Context";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <Grid centered padded>
      {user && <h1>Welcome {user.data.login}</h1>}
    </Grid>
  );
};

export default Home;
