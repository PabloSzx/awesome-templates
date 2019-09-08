import { gql } from "apollo-boost";
import { NextPage } from "next";
import Link from "next/link";
import { Button, Grid, Table } from "semantic-ui-react";

import Modal from "../../src/client/Components/Modal";

type TemplatesQuery = {
  templates: Array<{
    id: string;
    name: string;
    upvotesCount: number;
    owner: {
      data: {
        login: string;
      };
    };
    repository: {
      url: string;
    };
    languages: Array<{ name: string }>;
    libraries: Array<{ name: string }>;
    frameworks: Array<{ name: string }>;
  }>;
};

const Templates: NextPage<{ data: TemplatesQuery }> = ({ data }) => {
  return (
    <Grid centered padded>
      <Grid.Row>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Upvotes / Stars</Table.HeaderCell>
              <Table.HeaderCell>Languages</Table.HeaderCell>
              <Table.HeaderCell>Environment / Frameworks</Table.HeaderCell>
              <Table.HeaderCell>Libraries</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.templates.map(
              ({ name, owner, upvotesCount, repository: { url } }, key) => (
                <Modal
                  trigger={
                    <Table.Row key={key} className="cursorHover">
                      <Table.Cell>{name}</Table.Cell>
                      <Table.Cell>{upvotesCount}</Table.Cell>
                      <Table.Cell>Languages</Table.Cell>
                      <Table.Cell>Environment / Frameworks</Table.Cell>
                      <Table.Cell>Libraries</Table.Cell>
                    </Table.Row>
                  }
                  header={<h1>{name}</h1>}
                  dimmer="blurring"
                  key={key}
                >
                  <Grid centered>
                    <Grid.Row>
                      <h1>Owner: {owner.data.login}</h1>
                    </Grid.Row>
                    <Grid.Row>
                      <h2>Upvotes: {upvotesCount}</h2>
                    </Grid.Row>
                    <Grid.Row>
                      <h2>
                        <a href={url}>{url}</a>
                      </h2>
                    </Grid.Row>
                    <Grid.Row>
                      <Link
                        href={"/templates/[owner]/[name]"}
                        as={`/templates/${owner.data.login}/${name}`}
                      >
                        <Button primary>More info</Button>
                      </Link>
                    </Grid.Row>
                  </Grid>
                </Modal>
              )
            )}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};

Templates.getInitialProps = async ({ apolloClient }) => {
  const { data } = await apolloClient.query<TemplatesQuery>({
    query: gql`
      query {
        templates {
          id
          name
          upvotesCount
          owner {
            data {
              login
            }
          }
          repository {
            url
          }
          languages {
            name
          }
          libraries {
            name
          }
          frameworks {
            name
          }
        }
      }
    `,
  });

  return { data };
};

export default Templates;
