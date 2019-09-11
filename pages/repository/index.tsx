import gql from "graphql-tag";
import { NextPage } from "next";
import { FC } from "react";
import { ExecutionResult, MutationFunctionOptions, useMutation } from "react-apollo";
import AutoSizeInput from "react-input-autosize";
import { Flex } from "rebass";
import { Button, Form, Grid, Icon, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import RequireAuth from "../../src/client/Components/Auth/RequireAuth";

type ISearchRepoMutation = {
  searchRepository: Array<{
    nameWithOwner: string;
  }>;
};

const SearchRepoMutation = gql`
  mutation($input: String!) {
    searchRepository(input: $input) {
      nameWithOwner
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
        <AutoSizeInput
          className="ui input big"
          placeholder="..."
          value={input}
          minWidth={200}
          onChange={({ target: { value } }) => setInput(value)}
          disabled={loading}
        />
        <Button
          disabled={loading}
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
          {data.searchRepository.map(({ nameWithOwner }, key) => (
            <Table.Row key={key}>
              <Table.Cell>{nameWithOwner}</Table.Cell>
            </Table.Row>
          ))}
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
