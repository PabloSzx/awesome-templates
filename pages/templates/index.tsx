import { gql } from "apollo-boost";
import { NextPage } from "next";
import Link from "next/link";
import {
    Button, Checkbox, Dropdown, Form, Grid, Header, Icon, Image, Label, List, Segment, Table
} from "semantic-ui-react";
import styled from "styled-components";

import Modal from "../../src/client/Components/Modal";

type ITemplatesQuery = {
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
      starCount: number;
      url: string;
    };
    languages: Array<{ name: string; color?: string }>;
    libraries: Array<{ name: string; logoUrl?: string }>;
    frameworks: Array<{ name: string; logoUrl?: string }>;
    environments: Array<{ name: string; logoUrl?: string }>;
  }>;
  languages: Array<{ name: string }>;
  libraries: Array<{ name: string }>;
  frameworks: Array<{ name: string }>;
  environments: Array<{ name: string }>;
};

const TemplatesQuery = gql`
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
        starCount
      }
      languages {
        name
        color
      }
      libraries {
        name
        logoUrl
      }
      frameworks {
        name
        logoUrl
      }
      environments {
        name
        logoUrl
      }
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
    environments {
      name
    }
  }
`;

const FlexCenterStart = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;
const FlexCenterEnd = styled.div<{ padding_botom?: string }>`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: ${({ padding_botom }) => padding_botom || "auto"};
`;
const ListIcon = styled(List.Icon)`
  color: ${({ color_icon }: { color_icon?: string }) => color_icon || "black"};
`;

const FilterToggle = () => {
  return (
    <FlexCenterEnd padding_botom="1em">
      <Label basic>At least one</Label>
      <Checkbox slider></Checkbox>
      <Label basic>All</Label>
    </FlexCenterEnd>
  );
};

const Templates: NextPage<{ data: ITemplatesQuery }> = ({
  data: { templates, languages, libraries, frameworks, environments },
}) => {
  return (
    <Grid centered padded>
      <Grid.Row>
        <Grid.Column width={4}>
          <Form>
            <Segment>
              <Header as="h3">Name</Header>
              <Dropdown
                search
                text="Search by name"
                selection
                options={templates.map(({ name: value }, key) => ({
                  key,
                  value,
                  text: value,
                }))}
                fluid
              />
            </Segment>
            <Segment>
              <Header as="h3">Languages</Header>
              <FilterToggle />
              <Dropdown
                clearable
                multiple
                selection
                search
                text="Select Languages"
                options={languages.map(({ name: value }, key) => ({
                  key,
                  text: value,
                  value,
                }))}
                fluid
              />
            </Segment>
            <Segment>
              <Header as="h3">Environment</Header>
              <FilterToggle />
              <Dropdown
                clearable
                multiple
                selection
                search
                text="Select Environment"
                options={environments.map(({ name: value }, key) => ({
                  key,
                  text: value,
                  value,
                }))}
                fluid
              />
            </Segment>
            <Segment>
              <Header as="h3">Frameworks</Header>
              <FilterToggle />
              <Dropdown
                clearable
                multiple
                selection
                search
                text="Select Frameworks"
                options={frameworks.map(({ name: value }, key) => ({
                  key,
                  text: value,
                  value,
                }))}
                fluid
              />
            </Segment>

            <Segment>
              <Header as="h3">Libraries</Header>
              <FilterToggle />
              <Dropdown
                clearable
                multiple
                selection
                search
                text="Select Libraries"
                options={libraries.map(({ name: value }, key) => ({
                  key,
                  text: value,
                  value,
                }))}
                fluid
              />
            </Segment>
          </Form>
        </Grid.Column>
        <Grid.Column width={12}>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Upvotes / Stars</Table.HeaderCell>
                <Table.HeaderCell>Languages</Table.HeaderCell>
                <Table.HeaderCell>Environment</Table.HeaderCell>
                <Table.HeaderCell>Frameworks</Table.HeaderCell>
                <Table.HeaderCell>Libraries</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {templates.map(
                (
                  {
                    name,
                    owner,
                    upvotesCount,
                    repository: { url, starCount },
                    languages,
                    environments,
                    libraries,
                    frameworks,
                  },
                  key
                ) => (
                  <Modal
                    trigger={
                      <Table.Row key={key} className="cursorHover">
                        <Table.Cell>{name}</Table.Cell>
                        <Table.Cell>
                          <FlexCenterStart>
                            {starCount !== -1 && (
                              <Label basic>
                                <Icon name="star" color="yellow" />
                                {starCount}
                              </Label>
                            )}

                            <Label basic>
                              <Icon name="arrow up" color="orange" />
                              {upvotesCount}
                            </Label>
                          </FlexCenterStart>
                        </Table.Cell>
                        <Table.Cell>
                          <List>
                            {languages.map(({ name, color }, key) => (
                              <List.Item key={key}>
                                <ListIcon name="circle" color_icon={color} />
                                <List.Content>{name}</List.Content>
                              </List.Item>
                            ))}
                          </List>
                        </Table.Cell>
                        <Table.Cell>
                          <List>
                            {environments.map(({ name, logoUrl }, key) => (
                              <List.Item key={key}>
                                {logoUrl ? (
                                  <Image avatar src={logoUrl} />
                                ) : (
                                  <ListIcon size="large" name="globe" />
                                )}
                                <List.Content>
                                  <List.Header>{name}</List.Header>
                                </List.Content>
                              </List.Item>
                            ))}
                          </List>
                        </Table.Cell>
                        <Table.Cell>
                          <List>
                            {frameworks.map(({ name, logoUrl }, key) => (
                              <List.Item key={key}>
                                {logoUrl ? (
                                  <Image avatar src={logoUrl} />
                                ) : (
                                  <ListIcon size="large" name="sitemap" />
                                )}
                                <List.Content>
                                  <List.Header>{name}</List.Header>
                                </List.Content>
                              </List.Item>
                            ))}
                          </List>
                        </Table.Cell>
                        <Table.Cell>
                          <List verticalAlign="middle">
                            {libraries.map(({ name, logoUrl }, key) => (
                              <List.Item key={key}>
                                {logoUrl ? (
                                  <Image avatar src={logoUrl} />
                                ) : (
                                  <ListIcon size="large" name="book" />
                                )}
                                <List.Content>
                                  <List.Header>{name}</List.Header>
                                </List.Content>
                              </List.Item>
                            ))}
                          </List>
                        </Table.Cell>
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
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

Templates.getInitialProps = async ({ apolloClient }) => {
  const { data } = await apolloClient.query<ITemplatesQuery>({
    query: TemplatesQuery,
  });

  return { data };
};

export default Templates;
