import { gql } from "apollo-boost";
import _ from "lodash";
import { NextPage } from "next";
import Link from "next/link";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
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

enum filterToggleEnum {
  atLeastOne,
  all,
}
const FilterToggle: FC<{
  name: string;
  setParentToggle: Dispatch<SetStateAction<filterToggleEnum>>;
}> = ({ name, setParentToggle }) => {
  const { atLeastOne, all } = filterToggleEnum;

  const [checked, setChecked] = useRememberState(
    `${name}Toggle`,
    atLeastOne,
    true
  );

  useEffect(() => {
    setParentToggle(checked);
  }, [checked]);

  return (
    <FlexCenterEnd padding_botom="1em">
      <Label basic>At least one</Label>
      <Checkbox
        slider
        onChange={() =>
          setChecked(checked => (checked === atLeastOne ? all : atLeastOne))
        }
        checked={checked === all}
      />
      <Label basic>All</Label>
    </FlexCenterEnd>
  );
};

const FilterMenu: FC<{
  data: ITemplatesQuery;
  setParentFilters: Dispatch<SetStateAction<filtersState>>;
}> = ({
  data: { templates, languages, libraries, frameworks, environments },
  setParentFilters,
}) => {
  const [filterNames, setFilterNames] = useRememberState<string[]>(
    "filterMenuNames",
    [],
    true
  );
  const [filterLanguages, setFilterLanguages] = useRememberState<string[]>(
    "filterMenuLanguages",
    [],
    true
  );
  const [filterLanguagesToggle, setFilterLanguagesToggle] = useState(
    filterToggleEnum.atLeastOne
  );
  const [filterEnvironments, setFilterEnvironments] = useRememberState<
    string[]
  >("filterMenuEnvironments", [], true);
  const [filterEnvironmentsToggle, setFilterEnvironmentsToggle] = useState(
    filterToggleEnum.atLeastOne
  );
  const [filterFrameworks, setFilterFrameworks] = useRememberState<string[]>(
    "filterMenuFrameworks",
    [],
    true
  );
  const [filterFrameworksToggle, setFilterFrameworksToggle] = useState(
    filterToggleEnum.atLeastOne
  );
  const [filterLibraries, setFilterLibraries] = useRememberState<string[]>(
    "filterMenuLibraries",
    [],
    true
  );
  const [filterLibrariesToggle, setFilterLibrariesToggle] = useState(
    filterToggleEnum.atLeastOne
  );

  useEffect(() => {
    setParentFilters({
      names: filterNames,
      languages: [filterLanguages, filterLanguagesToggle],
      environments: [filterEnvironments, filterEnvironmentsToggle],
      frameworks: [filterFrameworks, filterFrameworksToggle],
      libraries: [filterLibraries, filterLibrariesToggle],
    });
  }, [
    filterNames,
    filterLanguages,
    filterLanguagesToggle,
    filterEnvironments,
    filterEnvironmentsToggle,
    filterFrameworks,
    filterFrameworksToggle,
    filterLibraries,
    filterLibrariesToggle,
  ]);

  return (
    <Form>
      <Segment>
        <Header as="h3">Name</Header>
        <Dropdown
          search
          placeholder="Search by name"
          selection
          multiple
          options={templates.map(({ name: value }, key) => ({
            key,
            value,
            text: value,
          }))}
          fluid
          onChange={(_e, { value }: any) => setFilterNames(value as string[])}
          value={filterNames}
        />
      </Segment>
      <Segment>
        <Header as="h3">Languages</Header>
        <FilterToggle
          name="languages"
          setParentToggle={setFilterLanguagesToggle}
        />
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
          onChange={(_e, { value }: any) =>
            setFilterLanguages(value as string[])
          }
          value={filterLanguages}
        />
      </Segment>
      <Segment>
        <Header as="h3">Environment</Header>
        <FilterToggle
          name="environment"
          setParentToggle={setFilterEnvironmentsToggle}
        />
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
          onChange={(_e, { value }: any) =>
            setFilterEnvironments(value as string[])
          }
          value={filterEnvironments}
        />
      </Segment>
      <Segment>
        <Header as="h3">Frameworks</Header>
        <FilterToggle
          name="frameworks"
          setParentToggle={setFilterFrameworksToggle}
        />
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
          onChange={(_e, { value }: any) =>
            setFilterFrameworks(value as string[])
          }
          value={filterFrameworks}
        />
      </Segment>

      <Segment>
        <Header as="h3">Libraries</Header>
        <FilterToggle
          name="libraries"
          setParentToggle={setFilterLibrariesToggle}
        />
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
          onChange={(_e, { value }: any) =>
            setFilterLibraries(value as string[])
          }
          value={filterLibraries}
        />
      </Segment>
    </Form>
  );
};

enum columnName {
  name = "Name",
  upvotes = "Upvotes / Stars",
  languages = "Languages",
  environment = "Environment",
  frameworks = "Frameworks",
  libraries = "Libraries",
}

const TemplatesTable: FC<{
  templates: ITemplatesQuery["templates"];
}> = ({ templates }) => {
  const [sortedTemplates, setSortedTemplates] = useState(templates);
  const [direction, setDirection] = useRememberState<
    "ascending" | "descending" | null
  >("templatesTableDirection", null, true);
  const [column, setColumn] = useRememberState<columnName | null>(
    "templatesTableColumn",
    null,
    true
  );

  const handleSort = (clickedColumn: columnName) => {
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
    setSortedTemplates(
      _.orderBy(
        templates,
        [
          ({
            name,
            upvotesCount,
            environments,
            languages,
            libraries,
            frameworks,
          }) => {
            switch (column) {
              case columnName.name:
                return name;
              case columnName.upvotes:
                return upvotesCount;
              case columnName.environment:
                return _.get(_.head(environments), "name", -1);
              case columnName.languages:
                return _.get(_.head(languages), "name", -1);
              case columnName.libraries:
                return _.get(_.head(libraries), "name", -1);
              case columnName.frameworks:
                return _.get(_.head(frameworks), "name", -1);
              default:
                return 0;
            }
          },
          ({ repository: { starCount } }) => starCount,
          ({ name }) => name,
        ],
        [
          direction === "descending" ? "desc" : "asc",
          direction === "descending" ? "desc" : "asc",
          direction === "descending" ? "desc" : "asc",
        ]
      )
    );
  }, [templates, column, direction]);

  const TableHeaderCell: FC<{ name: columnName }> = ({ name }) => (
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
          {Object.values(columnName).map((name: columnName, key) => (
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

type filtersState = {
  names: string[];
  languages: [string[], filterToggleEnum];
  environments: [string[], filterToggleEnum];
  frameworks: [string[], filterToggleEnum];
  libraries: [string[], filterToggleEnum];
};

const passAllOrAtLeastOne = (
  filter: [string[], filterToggleEnum],
  listToFilter: { name: string }[]
) => {
  if (filter[1] === filterToggleEnum.all) {
    if (
      !_.isEqual(
        _.sortBy(
          _.intersection(listToFilter.map(({ name }) => name), filter[0])
        ),
        _.sortBy(filter[0])
      )
    ) {
      return false;
    }
  } else {
    if (
      _.isEmpty(_.intersection(listToFilter.map(({ name }) => name), filter[0]))
    ) {
      return false;
    }
  }
  return true;
};

const Templates: NextPage<{ data: ITemplatesQuery }> = ({ data }) => {
  const [filteredTemplates, setFilteredTemplates] = useState(data.templates);
  const [filters, setFilters] = useState<filtersState>({
    names: [],
    languages: [[], filterToggleEnum.atLeastOne],
    environments: [[], filterToggleEnum.atLeastOne],
    frameworks: [[], filterToggleEnum.atLeastOne],
    libraries: [[], filterToggleEnum.atLeastOne],
  });

  useEffect(() => {
    setFilteredTemplates(
      _.filter(
        data.templates,
        ({ name, languages, environments, frameworks, libraries }) => {
          if (!_.isEmpty(filters.names)) {
            if (!_.includes(filters.names, name)) return false;
          }
          if (!_.isEmpty(filters.languages[0])) {
            if (!passAllOrAtLeastOne(filters.languages, languages))
              return false;
          }
          if (!_.isEmpty(filters.environments[0])) {
            if (!passAllOrAtLeastOne(filters.environments, environments))
              return false;
          }
          if (!_.isEmpty(filters.frameworks[0])) {
            if (!passAllOrAtLeastOne(filters.frameworks, frameworks))
              return false;
          }
          if (!_.isEmpty(filters.libraries[0])) {
            if (!passAllOrAtLeastOne(filters.libraries, libraries))
              return false;
          }
          return true;
        }
      )
    );
  }, [filters]);

  return (
    <Grid centered padded>
      <Grid.Row>
        <Grid.Column width={4}>
          <FilterMenu data={data} setParentFilters={setFilters} />
        </Grid.Column>
        <Grid.Column width={12}>
          <TemplatesTable templates={filteredTemplates} />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

Templates.getInitialProps = async ({ apolloClient }) => {
  try {
    const { data, errors } = await apolloClient.query<ITemplatesQuery>({
      query: TemplatesQuery,
    });

    console.error(633, errors);

    return { data };
  } catch (err) {
    console.error(638, err);
    throw err;
  }
};

export default Templates;
