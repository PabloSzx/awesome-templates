import { gql } from "apollo-boost";
import sortBy from "lodash/sortBy";
import { NextPage } from "next";
import Link from "next/link";
import { FunctionComponent, useEffect, useState } from "react";
import {
    Button, Checkbox, Dropdown, Form, Grid, Header, Icon, Image, Label, List, Segment, Table
} from "semantic-ui-react";
import styled from "styled-components";
import { useRememberState } from "use-remember-state";

import Modal from "../../src/client/Components/Modal";

interface ITemplatesQuery {
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
}

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

const FilterMenu: FunctionComponent<{ data: ITemplatesQuery }> = ({
  data: { templates, languages, libraries, frameworks, environments },
}) => {
  return (
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
  );
};

enum columnNames {
  name = "Name",
  upvotes = "Upvotes / Stars",
  languages = "Languages",
  environment = "Environment",
  frameworks = "Frameworks",
  libraries = "Libraries",
}

const TemplatesTable: FunctionComponent<{
  templates: ITemplatesQuery["templates"];
}> = ({ templates }) => {
  const [sortedTemplates, setSortedTemplates] = useState(templates);
  const [direction, setDirection] = useRememberState<
    "ascending" | "descending" | null
  >("templatesTableDirection", null, true);
  const [column, setColumn] = useRememberState<columnNames | null>(
    "templatesTableColumn",
    null,
    true
  );

  const handleSort = (clickedColumn: columnNames) => {
    if (column !== clickedColumn) {
      setColumn(clickedColumn);
      setDirection("ascending");
    } else {
      setSortedTemplates(sortedTemplates.reverse());
      setDirection(direction =>
        direction === "ascending" ? "descending" : "ascending"
      );
    }
  };

  useEffect(() => {
    let sortedTemplatesTemp: typeof templates;
    sortedTemplatesTemp = sortBy(
      templates,
      ({ name, upvotesCount, environments }) => {
        switch (column) {
          case columnNames.name:
            return name;
          case columnNames.upvotes:
            return upvotesCount;
          case columnNames.environment:
            return environments[0] && environments[0].name;
          default:
            return 0;
        }
      }
    );
    if (direction === "descending") {
      sortedTemplatesTemp.reverse();
    }

    setSortedTemplates(sortedTemplatesTemp);
  }, [column, direction]);

  const TableHeaderCell: FunctionComponent<{ name: columnNames }> = ({
    name,
  }) => (
    <Table.HeaderCell
      sorted={direction && column === name ? direction : undefined}
      onClick={() => handleSort(name)}
    >
      {name}
    </Table.HeaderCell>
  );

  return (
    <Table selectable sortable>
      <Table.Header>
        <Table.Row>
          {Object.values(columnNames).map((name: columnNames, key) => (
            <TableHeaderCell name={name} key={key} />
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedTemplates.map(
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
  );
};

const Templates: NextPage<{ data: ITemplatesQuery }> = ({ data }) => {
  return (
    <Grid centered padded>
      <Grid.Row>
        <Grid.Column width={4}>
          <FilterMenu data={data} />
        </Grid.Column>
        <Grid.Column width={12}>
          <TemplatesTable templates={data.templates} />
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
