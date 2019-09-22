import gql from "graphql-tag";
import Link from "next/link";
import { NextRouter, withRouter } from "next/router";
import { FunctionComponent, useContext, useEffect, useState } from "react";
import { useLazyQuery, useMutation } from "react-apollo";
import { Box, Flex, Image } from "rebass";
import {
    Button, Card, Grid, Header, Icon, Image as SemanticImage, Input, Label, Menu, Message, Segment
} from "semantic-ui-react";
import styled from "styled-components";
import { useRememberState } from "use-remember-state";

import { APILevel } from "../../../consts";
import { AuthContext } from "../Auth/Context";
import Modal from "../Modal";

const InstallGitHubApp: FunctionComponent = () => {
  return (
    <a
      href="https://github.com/apps/awesome-templates-app-dev/installations/new"
      target="_blank"
    >
      <Card.Group>
        <Card>
          <Card.Content>
            <SemanticImage
              floated="right"
              src="/static/github_logo.png"
              size="mini"
            ></SemanticImage>
            <Card.Header>Install GitHub App</Card.Header>
            <Card.Meta>It allows you to publish templates and more</Card.Meta>
          </Card.Content>
        </Card>
      </Card.Group>
    </a>
  );
};

const PersonalToken: FunctionComponent<{
  type: "add" | "modify";
  refetch: () => void;
}> = ({ type, refetch }) => {
  const [token, setToken] = useRememberState("PersonalToken", "", {
    SSR: true,
  });
  const [tokenModified, setTokenModified] = useState(true);
  const [
    saveToken,
    {
      loading,
      data: { modifyPersonalAccessToken } = {
        modifyPersonalAccessToken: undefined,
      },
    },
  ] = useMutation<
    { modifyPersonalAccessToken: boolean },
    { token: string }
  >(gql`
    mutation($token: String!) {
      modifyPersonalAccessToken(token: $token)
    }
  `);

  useEffect(() => {
    if (modifyPersonalAccessToken !== undefined) refetch();
  }, [modifyPersonalAccessToken]);

  return (
    <Modal
      trigger={
        <Card className="cursorHover" fluid>
          <Card.Content>
            <SemanticImage
              floated="right"
              src="/static/github_logo.png"
              size="mini"
            ></SemanticImage>
            <Card.Header>
              {type === "add"
                ? "Add personal access token"
                : "Modify existing personal access token"}
            </Card.Header>

            <Card.Meta>
              It allows you to publish templates from any GitHub repository and
              many more features
            </Card.Meta>
          </Card.Content>
        </Card>
      }
      actionsModal={
        <>
          <Button
            primary
            onClick={() => {
              saveToken({
                variables: {
                  token,
                },
              });
              setTokenModified(false);
            }}
            disabled={loading}
            loading={loading}
          >
            <Icon name="save"></Icon>
            Save Personal Access Token
          </Button>
        </>
      }
    >
      <Grid centered>
        <Grid.Row>
          <Input
            value={token}
            onChange={({ target: { value } }) => {
              setToken(value);
              setTokenModified(true);
            }}
            placeholder="1nHqSTnW1ISB..."
            label={
              <Label color="black">
                <Icon name="key"></Icon>
                Token
              </Label>
            }
            size="huge"
            disabled={loading}
          ></Input>
        </Grid.Row>
        <Grid.Row>
          {!tokenModified && modifyPersonalAccessToken === false && (
            <Message error>Token verification failed!</Message>
          )}
          {!tokenModified && modifyPersonalAccessToken && (
            <Message success>Valid token!</Message>
          )}
        </Grid.Row>
      </Grid>
    </Modal>
  );
};

const Background = styled(Segment)`
  width: 100vw;
  position: relative;
  top: 0;
  left: 0;
`;

const Navigation: FunctionComponent<{ router: NextRouter }> = ({
  router: { pathname },
}) => {
  const { user, loading, setUser } = useContext(AuthContext);
  const [
    checkAPILevel,
    { data: dataCheckAPILevel, refetch: refetchCheckAPILevel },
  ] = useLazyQuery<{
    checkAPILevel: APILevel;
  }>(
    gql`
      query {
        checkAPILevel
      }
    `,
    { returnPartialData: true }
  );
  const [logout] = useMutation<boolean>(gql`
    mutation {
      logout
    }
  `);

  useEffect(() => {
    if (user) {
      checkAPILevel();
    }
  }, [user]);
  return (
    <Background>
      <Flex paddingTop="1" alignItems="center">
        <Box width={2 / 4}>
          <Menu size="huge" compact secondary>
            <Link href="/">
              <Menu.Item name="home" active={pathname === "/"} />
            </Link>
            <Link href="/templates">
              <Menu.Item name="Templates" active={pathname === "/templates"} />
            </Link>
            {user && dataCheckAPILevel && (
              <>
                {(dataCheckAPILevel.checkAPILevel === APILevel.MEDIUM ||
                  dataCheckAPILevel.checkAPILevel === APILevel.ADVANCED) && (
                  <Link href="/myRepositories">
                    <Menu.Item
                      name="My Repositories"
                      active={pathname === "/myRepositories"}
                    />
                  </Link>
                )}

                {dataCheckAPILevel.checkAPILevel === APILevel.ADVANCED && (
                  <Link href="/repository">
                    <Menu.Item
                      name="Any Repository"
                      active={pathname === "/repository"}
                    />
                  </Link>
                )}
              </>
            )}
          </Menu>
        </Box>
        <Box width={1 / 4}>
          {user &&
            dataCheckAPILevel &&
            (() => {
              switch (dataCheckAPILevel.checkAPILevel) {
                case APILevel.BASIC:
                  return <InstallGitHubApp />;
                case APILevel.MEDIUM:
                  return (
                    <PersonalToken type="add" refetch={refetchCheckAPILevel} />
                  );
                case APILevel.ADVANCED:
                default:
                  return (
                    <PersonalToken
                      type="modify"
                      refetch={refetchCheckAPILevel}
                    />
                  );
              }
            })()}
        </Box>
        <Box width={1 / 4}>
          {(() => {
            if (loading) {
              return <Icon name="spinner" loading />;
            }
            if (!user) {
              return (
                <a href="/api/login/github">
                  <Image src="/static/github_login.png" />
                </a>
              );
            }
            return (
              <Flex alignItems="center" padding="1">
                <Box width={3 / 4}>
                  <Card>
                    <Card.Content>
                      <Header textAlign="center">{user.data.login}</Header>
                    </Card.Content>
                  </Card>
                </Box>
                <Box width={1 / 4}>
                  <Button
                    negative
                    type="button"
                    onClick={async () => {
                      await logout();

                      setUser(null);
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Flex>
            );
          })()}
        </Box>
      </Flex>
    </Background>
  );
};

export default withRouter(Navigation);
