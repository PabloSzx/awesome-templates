import { gql } from "apollo-boost";
import { NextPage } from "next";
import Link from "next/link";
import { Button, Card, Grid } from "semantic-ui-react";

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
    <Grid centered>
      {data.templates.map(
        ({ name, owner, upvotesCount, repository: { url } }, key) => (
          <Grid.Row key={key}>
            <Modal
              trigger={<Card>{name}</Card>}
              header={<h1>{name}</h1>}
              dimmer="blurring"
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
          </Grid.Row>
        )
      )}
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
