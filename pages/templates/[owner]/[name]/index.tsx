import gql from "graphql-tag";
import _ from "lodash";
import { NextPage } from "next";
import { Card, Grid, Icon } from "semantic-ui-react";

type TemplateQuery = {
  template: {
    name: string;
    upvotesCount: number;
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
  } | null;
};

const TemplatePage: NextPage<TemplateQuery> = ({ template }) => {
  if (template) {
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
            </Grid>
          </Card.Content>
        </Card>
      </Grid>
    );
  }

  return <div>not found!</div>;
};

TemplatePage.getInitialProps = async ({
  query: { owner, name },
  apolloClient,
}) => {
  let templateData: TemplateQuery = { template: null };
  if (_.isString(owner) && _.isString(name)) {
    templateData = (await apolloClient.query<
      TemplateQuery,
      {
        name: string;
        owner: string;
      }
    >({
      query: gql`
        query($name: String!, $owner: String!) {
          template(name: $name, owner: $owner) {
            name
            upvotesCount
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
          }
        }
      `,
      variables: {
        owner,
        name,
      },
    })).data;
  }
  return templateData;
};

export default TemplatePage;
