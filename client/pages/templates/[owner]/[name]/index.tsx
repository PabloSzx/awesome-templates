import gql from "graphql-tag";
import _ from "lodash";
import { NextPage } from "next";
import { useQuery } from "react-apollo";
import { Card, Grid, Icon } from "semantic-ui-react";

type TemplateQuery = {
  template: {
    name: string;
    upvotesCount: number;
    upvotes: {
      id: string;
      data: {
        login: string;
      };
    }[];
    owner: {
      data: {
        login: string;
        url: string;
        name: string;
        bio?: string;
      };
    };
    repository: {
      nameWithOwner: string;
      starCount: number;
      url: string;
    };
    languages: {
      name: string;
      color: string;
    }[];
    primaryLanguage?: {
      name: string;
      color: string;
    };
    libraries: {
      id: string;
      name: string;
      url?: string;
      logoUrl?: string;
    }[];
    environments: {
      id: string;
      name: string;
      url?: string;
      logoUrl?: string;
    }[];
    frameworks: {
      id: string;
      name: string;
      url?: string;
      logoUrl?: string;
    }[];
  } | null;
};

const TemplatePage: NextPage<{ name: string; owner: string }> = ({
  name,
  owner,
}) => {
  const { data } = useQuery<
    TemplateQuery,
    {
      name: string;
      owner: string;
    }
  >(
    gql`
      query($name: String!, $owner: String!) {
        template(name: $name, owner: $owner) {
          name
          upvotesCount
          upvotes {
            id
            data {
              login
            }
          }
          owner {
            data {
              login
              url
              name
              bio
            }
          }
          repository {
            nameWithOwner
            starCount
            url
          }
          languages {
            name
            color
          }
          primaryLanguage {
            name
            color
          }
          libraries {
            id
            name
            url
            logoUrl
          }
          environments {
            id
            name
            url
            logoUrl
          }
          frameworks {
            id
            name
            url
            logoUrl
          }
        }
      }
    `,
    {
      variables: {
        owner,
        name,
      },
    }
  );

  if (data && data.template) {
    const { template } = data;
    return (
      <Grid centered padded style={{ paddingTop: "2em" }}>
        <Card>
          <Card.Content>
            <Grid padded>
              <Grid.Row>{template.name}</Grid.Row>
              <Grid.Row>Upvotes: {template.upvotesCount}</Grid.Row>

              <Grid.Row>
                Repository:{" "}
                <a href={template.repository.url}>{template.repository.url}</a>
              </Grid.Row>
              {template.repository.starCount !== -1 && (
                <Grid.Row>
                  <Icon name="star"></Icon> {template.repository.starCount}
                </Grid.Row>
              )}

              <Grid.Row>
                <Card>
                  <Card.Meta>
                    <a href={template.owner.data.url}>
                      {template.owner.data.url}
                    </a>
                  </Card.Meta>
                  <Card.Header>{template.owner.data.login}</Card.Header>
                  {template.owner.data.bio && (
                    <Card.Description></Card.Description>
                  )}
                  {template.owner.data.name && (
                    <Card.Content>{template.owner.data.name}</Card.Content>
                  )}
                </Card>
              </Grid.Row>
              {/* <Grid.Row>{JSON.stringify(data.template, null, 4)}</Grid.Row> */}
            </Grid>
          </Card.Content>
        </Card>
      </Grid>
    );
  }

  return <div>not found!</div>;
};

TemplatePage.getInitialProps = async ({ query: { owner, name } }) => {
  if (_.isString(owner) && _.isString(name)) {
    return {
      owner,
      name,
    };
  }

  throw new Error("Bad query parameters");
};

export default TemplatePage;
