import { gql } from "apollo-boost";
import _ from "lodash";
import { NextPage } from "next";
import Link from "next/link";
import {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Checkbox,
  Dimmer,
  Dropdown,
  Form,
  Grid,
  Header,
  Icon,
  Image,
  Label,
  List,
  Loader as LoaderSemantic,
  Segment,
  Table,
} from "semantic-ui-react";
import styled from "styled-components";
import { useRememberState } from "use-remember-state";

import { useLazyQuery, useMutation, useQuery } from "@apollo/react-hooks";

import { AuthContext } from "../../src/Components/Auth/Context";
import Loader from "../../src/Components/Loader";
import Modal from "../../src/Components/Modal";
import ConfirmModal from "../../src/Components/Modal/Confirm";
import RepositoryPublishModalContent from "../../src/Components/RepositoryPublish";

interface ITemplatesQuery {
  templates: Array<{
    _id: string;
    name: string;
    upvotesCount: number;
    owner: {
      _id: string;
      githubId: string;
      data: {
        login: string;
        url: string;
      };
    };
    repository: {
      _id: string;
      githubId: string;
      starCount: number;
      url: string;
      owner: {
        _id: string;
      };
    };
    languages: Array<{ name: string; color?: string; _id: string }>;
    libraries: Array<{ name: string; logoUrl?: string; _id: string }>;
    frameworks: Array<{ name: string; logoUrl?: string; _id: string }>;
    environments: Array<{ name: string; logoUrl?: string; _id: string }>;
  }>;
  languages: Array<{ name: string; _id: string }>;
  libraries: Array<{ name: string; _id: string }>;
  frameworks: Array<{ name: string; _id: string }>;
  environments: Array<{ name: string; _id: string }>;
}

const TemplatesQuery = gql`
  query {
    templates {
      _id
      name
      upvotesCount
      owner {
        _id
        githubId
        data {
          login
          url
        }
      }
      repository {
        _id
        githubId
        url
        starCount
        owner {
          _id
        }
      }
      languages {
        _id
        name
        color
      }
      libraries {
        _id
        name
        logoUrl
      }
      frameworks {
        _id
        name
        logoUrl
      }
      environments {
        _id
        name
        logoUrl
      }
    }
    languages {
      name
    }
    libraries {
      _id
      name
    }
    frameworks {
      _id
      name
    }
    environments {
      _id
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
          options={languages.map(({ _id: value, name: text }, key) => ({
            key,
            text,
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
          options={environments.map(({ name: text, _id: value }, key) => ({
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
          options={frameworks.map(({ name: text, _id: value }, key) => ({
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
          options={libraries.map(({ name: text, _id: value }, key) => ({
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
      mutation($id: ObjectId!) {
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
    mutation($id: ObjectId!) {
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
      upvotedTemplates: { _id: string }[];
    };
  }>(
    gql`
      query {
        current_user {
          _id
          upvotedTemplates {
            _id
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
            _id,
            name,
            owner,
            upvotesCount,
            repository: {
              _id: repositoryId,
              githubId: repositoryGithubId,
              url,
              starCount,
              owner: { _id: repoOwnerId },
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
                            value => value._id === _id
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
              key={_id}
              id={`${_id}TemplateModal`}
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
                                  id: _id,
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
                              value => value._id === _id
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
                        owner._id === user._id ||
                        repoOwnerId === user._id) && (
                        <>
                          <Grid.Row>
                            <ConfirmModal
                              onConfirm={async () => {
                                await removeTemplate({
                                  variables: {
                                    id: _id,
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
                                  githubId: repositoryGithubId,
                                  name,
                                  owner: { githubId: owner.githubId },
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
  listToFilter: { _id?: string; name: string }[],
  param: "_id" | "name"
) => {
  if (filter[1] === filterToggleEnum.all) {
    if (
      !_.isEqual(
        _.sortBy(
          _.intersection(
            listToFilter.map(({ _id, name }) => (param === "_id" ? _id : name)),
            filter[0]
          )
        ),
        _.sortBy(filter[0])
      )
    ) {
      return false;
    }
  } else {
    if (
      _.isEmpty(
        _.intersection(
          listToFilter.map(({ _id, name }) => (param === "_id" ? _id : name)),
          filter[0]
        )
      )
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
            if (!passAllOrAtLeastOne(filters.languages, languages, "_id"))
              return false;
          }
          if (!_.isEmpty(filters.environments[0])) {
            if (!passAllOrAtLeastOne(filters.environments, environments, "_id"))
              return false;
          }
          if (!_.isEmpty(filters.frameworks[0])) {
            if (!passAllOrAtLeastOne(filters.frameworks, frameworks, "_id"))
              return false;
          }
          if (!_.isEmpty(filters.libraries[0])) {
            if (!passAllOrAtLeastOne(filters.libraries, libraries, "_id"))
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
