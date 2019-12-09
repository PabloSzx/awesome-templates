import gql from "graphql-tag";
import { NextPage } from "next";
import { FC } from "react";
import { Flex } from "rebass";
import { Button, Form, Grid, Icon, Input, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { ExecutionResult, MutationFunctionOptions } from "@apollo/react-common";
import { useMutation } from "@apollo/react-hooks";

import RequireAuth from "../../src/Components/Auth/RequireAuth";
import Modal from "../../src/Components/Modal";
import RepositoryPublishModalContent from "../../src/Components/RepositoryPublish";

type ISearchRepoMutation = {
  searchRepository: Array<{
    id: string;
    nameWithOwner: string;
    languages: { name: string }[];
    primaryLanguage?: {
      name: string;
    };
    owner: {
      id: string;
    };
  }>;
};

const SearchRepoMutation = gql`
  mutation($input: String!) {
    searchRepository(input: $input) {
      id
      nameWithOwner
      languages {
        name
      }
      primaryLanguage {
        name
      }
      owner {
        id
      }
    }
  }
`;

const SearchRepository: FC<{
  searchRepository: (
    options?:
      | MutationFunctionOptions<
          ISearchRepoMutation,
          {
            input: string;
          }
        >
      | undefined
  ) => Promise<ExecutionResult<ISearchRepoMutation>>;
  loading: boolean;
}> = ({ searchRepository, loading }) => {
  const [input, setInput] = useRememberState("searchRepositoryInput", "", {
    SSR: true,
  });

  return (
    <Form>
      <Flex justifyContent="center" alignItems="stretch">
        <Input
          placeholder="..."
          value={input}
          onChange={(_e, { value }) => setInput(value)}
          disabled={loading}
          size="big"
          style={{
            width: `${Math.min(Math.max(input.length, 22), 44) * 0.8}rem`,
          }}
        />
        <Button
          disabled={input.length === 0 || loading}
          loading={loading}
          onClick={() => searchRepository({ variables: { input } })}
          primary
          size="large"
          icon
          labelPosition="right"
        >
          <Icon name="search" />
          Search Repository
        </Button>
      </Flex>
    </Form>
  );
};

const RepositoriesTable: FC<{ data?: ISearchRepoMutation }> = ({ data }) => {
  if (data) {
    return (
      <Table selectable sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.searchRepository.map((repo, key) => {
            const { nameWithOwner } = repo;
            return (
              <Modal
                trigger={
                  <Table.Row className="cursorHover">
                    <Table.Cell>{nameWithOwner}</Table.Cell>
                  </Table.Row>
                }
                dimmer="blurring"
                key={repo.id}
              >
                <RepositoryPublishModalContent>
                  {{ ...repo, name: nameWithOwner }}
                </RepositoryPublishModalContent>
              </Modal>
            );
          })}
        </Table.Body>
      </Table>
    );
  }

  return null;
};

const AnyRepositoryPage: NextPage = () => {
  const [searchRepository, { data, loading }] = useMutation<
    ISearchRepoMutation,
    {
      input: string;
    }
  >(SearchRepoMutation);

  return (
    <RequireAuth>
      <Grid centered padded>
        <Grid.Row>
          <SearchRepository
            searchRepository={searchRepository}
            loading={loading}
          />
        </Grid.Row>

        <Grid.Row>
          <RepositoriesTable data={data} />
        </Grid.Row>
      </Grid>
    </RequireAuth>
  );
};

export default AnyRepositoryPage;
