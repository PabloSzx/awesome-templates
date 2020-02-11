import gql from "graphql-tag";
import { NextPage } from "next";
import { FC, useEffect, useState } from "react";
import { Flex } from "rebass";
import {
  Checkbox,
  Form,
  Grid,
  Icon,
  Input,
  Label,
  Table,
} from "semantic-ui-react";
import { useRememberState } from "use-remember-state";

import { useQuery } from "@apollo/react-hooks";

import RequireAuth from "../../src/Components/Auth/RequireAuth";
import Loader from "../../src/Components/Loader";
import Modal from "../../src/Components/Modal";
import RepositoryPublishModalContent from "../../src/Components/RepositoryPublish";

export type RepoQueryType = {
  id: string;
  name: string;
  starCount: number;
  url: string;
  isTemplate: boolean;
  languages: { name: string }[];
  primaryLanguage?: {
    name: string;
  };
  owner: {
    id: string;
  };
};

const Repositories: FC = () => {
  const { data, loading } = useQuery<{
    viewer: {
      repositories: RepoQueryType[];
    };
  }>(gql`
    query {
      viewer {
        id
        repositories(isTemplate: null) {
          isTemplate
          id
          name
          starCount
          url
          languages {
            name
          }
          primaryLanguage {
            name
          }
          owner {
            id
          }
        }
      }
    }
  `);

  const [filteredData, setFilteredData] = useState([] as RepoQueryType[]);

  const [
    onlyTemplates,
    setOnlyTemplates,
  ] = useRememberState("onlyTemplatesMyRepositories", false, { SSR: true });
  const [input, setInput] = useRememberState("filterMyRepositories", "", {
    SSR: true,
  });

  useEffect(() => {
    if (data) {
      const loweredInput = input.toLowerCase();
      setFilteredData(
        data.viewer.repositories.filter(
          ({ name, primaryLanguage, languages, isTemplate }) =>
            (onlyTemplates ? isTemplate : true) &&
            (input
              ? name.toLowerCase().includes(loweredInput) ||
                (primaryLanguage &&
                  primaryLanguage.name.toLowerCase().includes(loweredInput)) ||
                languages.some(({ name }) =>
                  name.toLowerCase().includes(loweredInput)
                )
              : true)
        )
      );
    }
  }, [data, input, onlyTemplates]);

  if (loading || !data) {
    return <Loader />;
  }

  return (
    <Grid padded>
      <Grid.Row centered>
        <Form>
          <Flex alignItems="center">
            <Input
              placeholder="Filter by name or language"
              value={input}
              onChange={(_e, { value }) => setInput(value)}
              disabled={loading}
              size="big"
              style={{
                width: `${Math.min(Math.max(input.length, 22), 44) * 0.8}rem`,
              }}
            >
              <Label
                size="big"
                color="blue"
                style={{ verticalAlign: "middle" }}
              >
                Filter Your Repositories
              </Label>

              <input />
            </Input>
          </Flex>
          <Flex alignItems="center" padding="1em">
            <Label size="big" color="green">
              Only GitHub Templates
            </Label>
            <Checkbox
              toggle
              checked={onlyTemplates}
              onChange={() => setOnlyTemplates(!onlyTemplates)}
            />
          </Flex>
        </Form>
      </Grid.Row>
      <Grid.Row>
        <Table selectable sortable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Star count</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredData.map((repo, key) => {
              const { starCount, name, url, id: _id } = repo;
              return (
                <Modal
                  trigger={
                    <Table.Row className="cursorHover" key={key}>
                      <Table.Cell>{name}</Table.Cell>
                      <Table.Cell>
                        <Icon name="star" />
                        {starCount !== -1 ? starCount : "?"}
                      </Table.Cell>
                    </Table.Row>
                  }
                  headerBody={<>{name}</>}
                  dimmer="blurring"
                  key={key}
                  id={`${_id}MyRepoModal`}
                >
                  <RepositoryPublishModalContent>
                    {{
                      ...repo,
                      githubId: repo.id,
                      owner: { githubId: repo.owner.id },
                    }}
                  </RepositoryPublishModalContent>
                </Modal>
              );
            })}
          </Table.Body>
        </Table>
      </Grid.Row>
    </Grid>
  );
};

const myRepositories: NextPage = () => {
  return (
    <RequireAuth>
      <Repositories />
    </RequireAuth>
  );
};

export default myRepositories;
