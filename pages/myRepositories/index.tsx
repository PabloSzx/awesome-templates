import gql from "graphql-tag";
import { NextPage } from "next";
import { FunctionComponent } from "react";
import { useQuery } from "react-apollo";
import { Button, Card, Grid } from "semantic-ui-react";

import RequireAuth from "../../src/client/Components/Auth/RequireAuth";
import Loader from "../../src/client/Components/Loader";
import Modal from "../../src/client/Components/Modal";

const Repositories: FunctionComponent = () => {
  const { data, loading } = useQuery<{
    viewer: {
      repositories: { name: string; starCount: number; url: string }[];
    };
  }>(gql`
    query {
      viewer {
        repositories(isTemplate: null) {
          name
          starCount
          url
        }
      }
    }
  `);

  if (loading || !data) {
    return <Loader />;
  }

  return (
    <Grid centered padded>
      {data.viewer.repositories.map(({ name, starCount, url }, key) => (
        <Grid.Row key={key}>
          <Modal
            trigger={<Card className="cursorHover">{name}</Card>}
            actions={
              <>
                <Button primary>Publish Repository</Button>
              </>
            }
            header={<>{name}</>}
            dimmer="blurring"
          >
            <Grid>
              <Grid.Row>Star count: {starCount}</Grid.Row>
              <Grid.Row>
                <a href={url}>{url}</a>
              </Grid.Row>
            </Grid>
          </Modal>
        </Grid.Row>
      ))}
    </Grid>
  );
};

const myRepositories: NextPage = () => {
  return (
    <RequireAuth>
      <Repositories />
    </RequireAuth>
  );
};

export default myRepositories;
