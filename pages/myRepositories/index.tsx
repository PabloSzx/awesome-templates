import gql from "graphql-tag";
import { NextPage } from "next";
import { FC } from "react";
import { useQuery } from "react-apollo";
import { Button, Icon, Table } from "semantic-ui-react";

import RequireAuth from "../../src/client/Components/Auth/RequireAuth";
import Loader from "../../src/client/Components/Loader";
import Modal from "../../src/client/Components/Modal";
import RepositoryModalContent from "../../src/client/Components/RepositoryModal";
import RepositoryPublishModalContent from "../../src/client/Components/RepositoryPublishModal";

export type RepoQueryType = {
  id: string;
  name: string;
  starCount: number;
  url: string;
};

const Repositories: FC = () => {
  const { data, loading } = useQuery<{
    viewer: {
      repositories: RepoQueryType[];
    };
  }>(gql`
    query {
      viewer {
        repositories(isTemplate: null) {
          id
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
        {data.viewer.repositories.map((repo, key) => {
          const { starCount, name, url, id } = repo;
          return (
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
                  <Modal
                    trigger={<Button primary>Publish Repository</Button>}
                    id={`${id}MyRepoPublish`}
                  >
                    <RepositoryPublishModalContent>
                      {repo}
                    </RepositoryPublishModalContent>
                  </Modal>
                </>
              }
              header={<>{name}</>}
              dimmer="blurring"
              key={key}
              id={`${id}MyRepoModal`}
            >
              <RepositoryModalContent key={key}>{repo}</RepositoryModalContent>
            </Modal>
          );
        })}
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
