import gql from "graphql-tag";
import { NextPage } from "next";
import { useMutation } from "react-apollo";
import { Flex } from "rebass";
import { Button, Form, Grid, Icon, Input, Table } from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

const AnyRepositoryPage: NextPage = () => {
  const [input, setInput] = useRememberState("searchRepositoryInput", "", true);
  const [searchRepository, { data, loading }] = useMutation<
    {
      searchRepository: Array<{
        nameWithOwner: string;
      }>;
    },
    {
      input: string;
    }
  >(
    gql`
      mutation($input: String!) {
        searchRepository(input: $input) {
          nameWithOwner
        }
      }
    `,
    {
      variables: {
        input,
      },
    }
  );
  return (
    <Grid centered padded>
      <Grid.Row>
        <Form>
          <Flex justifyContent="center" alignItems="stretch">
            <Input
              size="massive"
              placeholder="Repository owner / name"
              value={input}
              onChange={(_e, { value }) => setInput(value)}
              disabled={loading}
            />
            <Button
              disabled={loading}
              loading={loading}
              onClick={() => searchRepository()}
              primary
              size="huge"
              icon
              labelPosition="right"
            >
              <Icon name="search" />
              Search Repository
            </Button>
          </Flex>
        </Form>
      </Grid.Row>
      <Grid.Row>
        <Table selectable sortable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data &&
              data.searchRepository.map(({ nameWithOwner }, key) => (
                <Table.Row key={key}>
                  <Table.Cell>{nameWithOwner}</Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};

export default AnyRepositoryPage;
