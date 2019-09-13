import { FC } from "react";
import { Grid } from "semantic-ui-react";

const RepositoryModalContent: FC<{
  children: {
    name: string;
  };
}> = ({ children: { name } }) => {
  return (
    <Grid>
      <Grid.Row>{name}</Grid.Row>
    </Grid>
  );
};

export default RepositoryModalContent;
