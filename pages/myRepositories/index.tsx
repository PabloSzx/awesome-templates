import gql from "graphql-tag";
import { NextPage } from "next";
import { FC } from "react";
import { useQuery } from "react-apollo";
import { Button, Grid, Icon, Table } from "semantic-ui-react";

import RequireAuth from "../../src/client/Components/Auth/RequireAuth";
import Loader from "../../src/client/Components/Loader";
import Modal from "../../src/client/Components/Modal";

const Repositories: FC = () => {
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
    <Table selectable sortable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Star count</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {data.viewer.repositories.map(({ name, starCount, url }, key) => (
          <Modal
            trigger={
              <Table.Row className="cursorHover" key={key}>
                <Table.Cell>{name}</Table.Cell>
                <Table.Cell>
                  <Icon name="star" />
                  {starCount}
                </Table.Cell>
              </Table.Row>
            }
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
        ))}
      </Table.Body>
    </Table>
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
