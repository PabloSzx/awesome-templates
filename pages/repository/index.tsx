import gql from "graphql-tag";
import { NextPage } from "next";
import { FC } from "react";
import { ExecutionResult, MutationFunctionOptions, useMutation } from "react-apollo";
import { Flex } from "rebass";
import { Button, Form, Grid, Icon, Input, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import RequireAuth from "../../src/client/Components/Auth/RequireAuth";
import Modal from "../../src/client/Components/Modal";
import RepositoryPublishModalContent from "../../src/client/Components/RepositoryPublishModal";

type ISearchRepoMutation = {
  searchRepository: Array<{
    id: string;
    nameWithOwner: string;
    languages: { name: string }[];
    primaryLanguage?: {
      name: string;
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
  const [input, setInput] = useRememberState("searchRepositoryInput", "", true);

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
                  <Table.Row key={key} className="cursorHover">
                    <Table.Cell>{nameWithOwner}</Table.Cell>
                  </Table.Row>
                }
                dimmer="blurring"
                key={key}
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
