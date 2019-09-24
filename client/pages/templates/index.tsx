import { gql } from "apollo-boost";
import _ from "lodash";
import { NextPage } from "next";
import Link from "next/link";
import { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "react-apollo";
import {
    Button, Checkbox, Dimmer, Dropdown, Form, Grid, Header, Icon, Image, Label, List,
    Loader as LoaderSemantic, Segment, Table
} from "semantic-ui-react";
import styled from "styled-components";
import { useRememberState } from "use-remember-state";

import { AuthContext } from "../../src/Components/Auth/Context";
import Loader from "../../src/Components/Loader";
import Modal from "../../src/Components/Modal";
import ConfirmModal from "../../src/Components/Modal/Confirm";
import RepositoryPublishModalContent from "../../src/Components/RepositoryPublish";

interface ITemplatesQuery {
  templates: Array<{
    id: string;
    name: string;
    upvotesCount: number;
    owner: {
      id: string;
      data: {
        login: string;
        url: string;
      };
    };
    repository: {
      id: string;
      starCount: number;
      url: string;
      owner: {
        id: string;
      };
    };
    languages: Array<{ name: string; color?: string }>;
    libraries: Array<{ name: string; logoUrl?: string; id: string }>;
    frameworks: Array<{ name: string; logoUrl?: string; id: string }>;
    environments: Array<{ name: string; logoUrl?: string; id: string }>;
  }>;
  languages: Array<{ name: string; id: string }>;
  libraries: Array<{ name: string; id: string }>;
  frameworks: Array<{ name: string; id: string }>;
  environments: Array<{ name: string; id: string }>;
}

const TemplatesQuery = gql`
  query {
    templates {
      id
      name
      upvotesCount
      owner {
        id
        data {
          login
          url
        }
      }
      repository {
        id
        url
        starCount
        owner {
          id
        }
      }
      languages {
        name
        color
      }
      libraries {
        id
        name
        logoUrl
      }
      frameworks {
        id
        name
        logoUrl
      }
      environments {
        id
        name
        logoUrl
      }
    }
    languages {
      name
    }
    libraries {
      id
      name
    }
    frameworks {
      id
      name
    }
    environments {
      id
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

  const [checked, setChecked] = useRememberState(`${name}Toggle`, atLeastOne, {
    SSR: true,
  });

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
    { SSR: true }
  );
  const [filterLanguages, setFilterLanguages] = useRememberState<string[]>(
    "filterMenuLanguages",
    [],
    { SSR: true }
  );
  const [filterLanguagesToggle, setFilterLanguagesToggle] = useRememberState(
    "filterLanguagesToggle",
    filterToggleEnum.atLeastOne,
    {
      SSR: true,
    }
  );
  const [filterEnvironments, setFilterEnvironments] = useRememberState<
    string[]
  >("filterMenuEnvironments", [], { SSR: true });
  const [
    filterEnvironmentsToggle,
    setFilterEnvironmentsToggle,
  ] = useRememberState(
    "filterMenuEnvironmentsToggle",
    filterToggleEnum.atLeastOne,
    {
      SSR: true,
    }
  );
  const [filterFrameworks, setFilterFrameworks] = useRememberState<string[]>(
    "filterMenuFrameworks",
    [],
    { SSR: true }
  );
  const [filterFrameworksToggle, setFilterFrameworksToggle] = useRememberState(
    "filterFrameworksToggle",
    filterToggleEnum.atLeastOne,
    {
      SSR: true,
    }
  );
  const [filterLibraries, setFilterLibraries] = useRememberState<string[]>(
    "filterMenuLibraries",
    [],
    { SSR: true }
  );
  const [filterLibrariesToggle, setFilterLibrariesToggle] = useRememberState(
    "filterLibrariesToggle",
    filterToggleEnum.atLeastOne,
    {
      SSR: true,
    }
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
    <Form as={Segment.Group}>
      <Segment>
        <Header as="h1" textAlign="center" block>
          Search filters
        </Header>
      </Segment>
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
          options={environments.map(({ name: text, id: value }, key) => ({
            key,
            text,
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
          options={frameworks.map(({ name: text, id: value }, key) => ({
            key,
            text,
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
          options={libraries.map(({ name: text, id: value }, key) => ({
            key,
            text,
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
  upvotes = "Stars / Upvotes",
  languages = "Languages",
  environment = "Environment",
  frameworks = "Frameworks",
  libraries = "Libraries",
}

const TemplatesTable: FC<{
  templates: ITemplatesQuery["templates"];
  refetch: () => Promise<any>;
}> = ({ templates, refetch }) => {
  const { user } = useContext(AuthContext);
  const [sortedTemplates, setSortedTemplates] = useState(templates);
  const [direction, setDirection] = useRememberState<
    "ascending" | "descending" | null
  >("templatesTableDirection", null, { SSR: true });
  const [column, setColumn] = useRememberState<columnName | null>(
    "templatesTableColumn",
    null,
    { SSR: true }
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

  const [removeTemplate, { loading: loadingRemoveTemplate }] = useMutation<
    {
      removeTemplate: string;
    },
    {
      id: string;
    }
  >(
    gql`
      mutation($id: String!) {
        removeTemplate(id: $id)
      }
    `
  );

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

  const [toggleUpvote, { loading: loadingToggleUpvote }] = useMutation<
    { toggleUpvote: boolean },
    { id: string }
  >(gql`
    mutation($id: String!) {
      toggleUpvote(id: $id)
    }
  `);

  const [
    getUpvotedTemplates,
    {
      data: dataUpvotedTemplates,
      refetch: refetchUpvotedTemplates,
      loading: loadingUpvotedTemplates,
    },
  ] = useLazyQuery<{
    current_user: {
      upvotedTemplates: { id: string }[];
    };
  }>(
    gql`
      query {
        current_user {
          id
          upvotedTemplates {
            id
          }
        }
      }
    `,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (user) {
      getUpvotedTemplates();
    }
  }, [user]);

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
          ({
            id,
            name,
            owner,
            upvotesCount,
            repository: {
              id: repositoryId,
              url,
              starCount,
              owner: { id: repoOwnerId },
            },
            languages,
            environments,
            libraries,
            frameworks,
          }) => (
            <Modal
              trigger={
                <Table.Row className="cursorHover">
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>
                    <FlexCenterStart>
                      {starCount !== -1 && (
                        <Label basic>
                          <Icon name="star" color="yellow" />
                          {starCount}
                        </Label>
                      )}

                      <Label
                        basic
                        color={
                          dataUpvotedTemplates &&
                          dataUpvotedTemplates.current_user.upvotedTemplates.find(
                            value => value.id === id
                          )
                            ? "red"
                            : undefined
                        }
                      >
                        <Icon name="arrow up" color="orange" />
                        {upvotesCount}
                      </Label>
                    </FlexCenterStart>
                  </Table.Cell>
                  <Table.Cell>
                    <List verticalAlign="middle">
                      {languages.map(({ name, color }, key) => (
                        <List.Item key={key}>
                          <ListIcon name="circle" color_icon={color} />
                          <List.Content>{name}</List.Content>
                        </List.Item>
                      ))}
                    </List>
                  </Table.Cell>
                  <Table.Cell>
                    <List verticalAlign="middle">
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
                    <List verticalAlign="middle">
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
              headerBody={<h1>{name}</h1>}
              dimmer="blurring"
              key={id}
              id={`${id}TemplateModal`}
            >
              {({ close }) => {
                return (
                  <Grid centered>
                    <Grid.Row>
                      <h1>
                        Template owner:{" "}
                        <a href={owner.data.url}>{owner.data.login}</a>
                      </h1>
                    </Grid.Row>
                    <Grid.Row>
                      <FlexCenterStart>
                        {starCount !== -1 && (
                          <a href={`${url}/stargazers`} target="_blank">
                            <Button className="cursorHover" basic color="grey">
                              <Icon name="star" color="yellow" />
                              {starCount}
                            </Button>
                          </a>
                        )}

                        <Button
                          className="cursorHover"
                          basic
                          loading={
                            loadingToggleUpvote || loadingUpvotedTemplates
                          }
                          disabled={
                            loadingToggleUpvote || loadingUpvotedTemplates
                          }
                          onClick={async () => {
                            if (user) {
                              await toggleUpvote({
                                variables: {
                                  id,
                                },
                              });

                              refetch();
                              refetchUpvotedTemplates();
                            } else {
                              window.location.href = "/api/login/github";
                            }
                          }}
                          color={
                            dataUpvotedTemplates &&
                            dataUpvotedTemplates.current_user.upvotedTemplates.find(
                              value => value.id === id
                            )
                              ? "red"
                              : "grey"
                          }
                        >
                          <Icon name="arrow up" color="orange" />
                          {upvotesCount}
                        </Button>
                      </FlexCenterStart>
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
                    {user &&
                      (user.admin ||
                        owner.id === user.id ||
                        repoOwnerId === user.id) && (
                        <>
                          <Grid.Row>
                            <ConfirmModal
                              onConfirm={async () => {
                                await removeTemplate({
                                  variables: {
                                    id,
                                  },
                                });

                                close();

                                await refetch();
                              }}
                              content={`Are you sure you want to remove the template "${name}"`}
                              header="Remove Template"
                              confirmButton={
                                <Button negative>Yes, remove template</Button>
                              }
                            >
                              <Button
                                negative
                                loading={loadingRemoveTemplate}
                                disabled={loadingRemoveTemplate}
                              >
                                Remove Template
                              </Button>
                            </ConfirmModal>
                          </Grid.Row>
                          <Grid.Row>
                            <Modal
                              trigger={
                                <Button positive>Update Template</Button>
                              }
                            >
                              <RepositoryPublishModalContent disablePublish>
                                {{
                                  id: repositoryId,
                                  name,
                                  owner,
                                }}
                              </RepositoryPublishModalContent>
                            </Modal>
                          </Grid.Row>
                        </>
                      )}
                  </Grid>
                );
              }}
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

const TemplatesDashboard: FC<{
  data: ITemplatesQuery;
  refetch: () => Promise<any>;
  loading: boolean;
}> = ({ data, refetch, loading }) => {
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
  }, [filters, data.templates]);

  return (
    <Grid centered padded>
      <Grid.Row>
        <Grid.Column width={4}>
          <FilterMenu data={data} setParentFilters={setFilters} />
        </Grid.Column>
        <Grid.Column width={12}>
          <Grid.Row textAlign="center">
            <Button
              circular
              icon
              positive
              onClick={() => {
                refetch();
              }}
              loading={loading}
              disabled={loading}
            >
              <Icon name="refresh" />
            </Button>
          </Grid.Row>

          <Dimmer.Dimmable as={Segment} blurring dimmed={loading} basic>
            <Dimmer inverted active={loading}>
              <LoaderSemantic />
            </Dimmer>
            <TemplatesTable templates={filteredTemplates} refetch={refetch} />
          </Dimmer.Dimmable>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

const Templates: NextPage = () => {
  const { data, error, refetch, loading } = useQuery<ITemplatesQuery>(
    TemplatesQuery,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  if (!data) {
    return <Loader active />;
  }
  if (error) {
    return <div>{JSON.stringify(error)}</div>;
  }
  return <TemplatesDashboard data={data} refetch={refetch} loading={loading} />;
};

export default Templates;
