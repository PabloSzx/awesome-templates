import { Field, Formik } from "formik";
import gql from "graphql-tag";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Flex } from "rebass";
import {
    Button, Checkbox, Divider, Dropdown, Form, Grid, Header, Input, Label
} from "semantic-ui-react";

import { AuthContext } from "../Auth/Context";
import EnvironmentModal from "../Environment";
import FrameworkModal from "../Framework";
import LibraryModal from "../Library";
import Modal from "../Modal";
import ConfirmModal from "../Modal/Confirm";

const RepositoryPublishModalContent: FC<{
  children: {
    name: string;
    id: string;
    languages: { name: string }[];
    primaryLanguage?: { name: string };
    owner: {
      id: string;
    };
  };
}> = ({ children: { name, id, languages, primaryLanguage, owner } }) => {
  const { user } = useContext(AuthContext);

  const {
    data: gitRepoData,
    loading: loadingGetRepoData,
    refetch: refetchGetGitRepoData,
  } = useQuery<
    {
      gitRepo?: {
        template?: {
          id: string;
          name: string;
          languages: {
            name: string;
          }[];
          primaryLanguage?: {
            name: string;
          };
          libraries: {
            id: string;
            name: string;
          }[];
          frameworks: {
            id: string;
            name: string;
          }[];
          environments: {
            id: string;
            name: string;
          }[];
          owner: {
            id: string;
          };
        };
      };
    },
    {
      id: string;
    }
  >(
    gql`
      query($id: String!) {
        gitRepo(id: $id) {
          template {
            id
            name
            languages {
              name
            }
            primaryLanguage {
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
            owner {
              id
            }
          }
        }
      }
    `,
    {
      variables: {
        id,
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: options, refetch: refetchOptions } = useQuery<{
    languages: { name: string }[];
    libraries: { name: string; id: string }[];
    frameworks: { name: string; id: string }[];
    environments: { name: string; id: string }[];
  }>(
    gql`
      query {
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
    `,
    {
      notifyOnNetworkStatusChange: true,
    }
  );
  const [
    createTemplate,
    { called: calledCreateTemplate, loading: loadingCreateTemplate },
  ] = useMutation<
    {},
    {
      repositoryId: string;
      name: string;
      primaryLanguage?: string;
      languages: string[];
      frameworks: string[];
      libraries: string[];
      environments: string[];
    }
  >(
    gql`
      mutation(
        $repositoryId: String!
        $name: String!
        $primaryLanguage: String
        $languages: [String!]!
        $frameworks: [String!]!
        $libraries: [String!]!
        $environments: [String!]!
      ) {
        createTemplate(
          name: $name
          repositoryId: $repositoryId
          primaryLanguage: $primaryLanguage
          languages: $languages
          frameworks: $frameworks
          libraries: $libraries
          environments: $environments
        ) {
          id
          name
          upvotesCount
          owner {
            id
            data {
              login
            }
          }
          repository {
            id
            url
            starCount
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
      }
    `,
    {}
  );

  const [
    updateTemplate,
    { loading: loadingUpdatingTemplate, called: calledUpdateTemplate },
  ] = useMutation<
    {},
    {
      templateId: string;
      repositoryId?: string;
      name: string;
      primaryLanguage?: string;
      languages: string[];
      frameworks: string[];
      libraries: string[];
      environments: string[];
    }
  >(
    gql`
      mutation(
        $templateId: String!
        $repositoryId: String
        $name: String!
        $primaryLanguage: String
        $languages: [String!]!
        $frameworks: [String!]!
        $libraries: [String!]!
        $environments: [String!]!
      ) {
        updateTemplate(
          templateId: $templateId
          name: $name
          repositoryId: $repositoryId
          primaryLanguage: $primaryLanguage
          languages: $languages
          frameworks: $frameworks
          libraries: $libraries
          environments: $environments
        ) {
          id
          name
          upvotesCount
          owner {
            id
            data {
              login
            }
          }
          repository {
            id
            url
            starCount
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
      }
    `
  );

  const [
    removeTemplate,
    { loading: loadingRemoveTemplate, called: calledRemoveTemplate },
  ] = useMutation<
    {
      removeTemplate: string;
    },
    {
      id: string;
    }
  >(gql`
    mutation($id: String!) {
      removeTemplate(id: $id)
    }
  `);

  useEffect(() => {
    if (
      (!loadingCreateTemplate && calledCreateTemplate) ||
      (!loadingUpdatingTemplate && calledUpdateTemplate) ||
      (!loadingRemoveTemplate && calledRemoveTemplate)
    ) {
      refetchGetGitRepoData();
    }
  }, [
    calledCreateTemplate,
    calledUpdateTemplate,
    calledRemoveTemplate,
    loadingCreateTemplate,
    loadingUpdatingTemplate,
    loadingRemoveTemplate,
  ]);

  const [update, setUpdate] = useState(false);

  useEffect(() => {
    if (
      user &&
      gitRepoData &&
      gitRepoData.gitRepo &&
      gitRepoData.gitRepo.template &&
      (user.admin ||
        owner.id === user.id ||
        gitRepoData.gitRepo.template.owner.id === user.id)
    ) {
      setUpdate(true);
      setToggleFormData(true);
    } else {
      setUpdate(false);
    }
  }, [gitRepoData, loadingGetRepoData]);

  const [toggleFormData, setToggleFormData] = useState(false);

  const [initialValues, setInitialValues] = useState({
    name,
    languages: languages.map(({ name }) => name),
    primaryLanguage: primaryLanguage ? primaryLanguage.name : undefined,
    frameworks: [] as string[],
    libraries: [] as string[],
    environments: [] as string[],
  });

  useEffect(() => {
    if (
      toggleFormData &&
      gitRepoData &&
      gitRepoData.gitRepo &&
      gitRepoData.gitRepo.template
    ) {
      const {
        name,
        languages,
        primaryLanguage,
        frameworks,
        libraries,
        environments,
      } = gitRepoData.gitRepo.template;
      setInitialValues({
        name,
        languages: languages.map(({ name }) => name),
        primaryLanguage: primaryLanguage ? primaryLanguage.name : undefined,
        frameworks: frameworks.map(({ id }) => id),
        libraries: libraries.map(({ id }) => id),
        environments: environments.map(({ id }) => id),
      });
    } else if (!toggleFormData) {
      setInitialValues({
        name,
        languages: languages.map(({ name }) => name),
        primaryLanguage: primaryLanguage ? primaryLanguage.name : undefined,
        frameworks: [] as string[],
        libraries: [] as string[],
        environments: [] as string[],
      });
    }
  }, [toggleFormData]);

  const loading =
    loadingCreateTemplate ||
    loadingGetRepoData ||
    loadingUpdatingTemplate ||
    loadingRemoveTemplate;

  const MemoizedFormik = useMemo(
    () => (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async ({
          name,
          languages,
          primaryLanguage,
          frameworks,
          libraries,
          environments,
        }) => {
          try {
            if (
              update &&
              gitRepoData &&
              gitRepoData.gitRepo &&
              gitRepoData.gitRepo.template
            ) {
              const { errors } = await updateTemplate({
                variables: {
                  name,
                  languages,
                  primaryLanguage: primaryLanguage || undefined,
                  frameworks,
                  libraries,
                  environments,
                  templateId: gitRepoData.gitRepo.template.id,
                },
              });

              if (errors) {
                console.log("errors2", errors);
              }
            } else {
              const { errors } = await createTemplate({
                variables: {
                  name,
                  languages,
                  primaryLanguage: primaryLanguage || undefined,
                  frameworks,
                  libraries,
                  environments,
                  repositoryId: id,
                },
              });

              if (errors) {
                console.log("errors2", errors);
              }
            }
          } catch (err) {
            console.error(err);
          }
        }}
      >
        {({ values, handleSubmit, setFieldValue }) => {
          return (
            <>
              <Grid.Row>
                <Form onSubmit={handleSubmit}>
                  <Form.Field>
                    <Label color="grey">Name</Label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Template Name"
                      disabled={loading}
                      loading={loading}
                      onChange={(_e, { value }) => setFieldValue("name", value)}
                      value={values.name}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Primary Language</Label>
                    <Dropdown
                      placeholder="Select the primary language"
                      search
                      selection
                      disabled={loading}
                      loading={loading}
                      clearable
                      options={values.languages.map((value, key) => ({
                        key,
                        text: value,
                        value,
                      }))}
                      onChange={(_e, { value }) =>
                        setFieldValue("primaryLanguage", value)
                      }
                      value={values.primaryLanguage || ""}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Languages</Label>
                    <Dropdown
                      id="languages"
                      search
                      placeholder="Select languages"
                      multiple
                      clearable
                      disabled={loading}
                      loading={loading}
                      selection
                      options={
                        options
                          ? options.languages.map(({ name: value }, key) => ({
                              key,
                              text: value,
                              value,
                            }))
                          : languages.map(({ name: value }, key) => ({
                              key,
                              text: value,
                              value,
                            }))
                      }
                      onChange={(_e, { value }) => {
                        setFieldValue("languages", value);
                        if (
                          values.primaryLanguage &&
                          Array.isArray(value) &&
                          !value.includes(values.primaryLanguage)
                        )
                          setFieldValue("primaryLanguage", undefined);
                      }}
                      value={values.languages}
                    ></Dropdown>
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Frameworks</Label>
                    <Modal<{ id?: string; name: string }>
                      openOnClick={false}
                      headerBody={({ data }) => {
                        return <Header>{data && data.name}</Header>;
                      }}
                      trigger={({ open, setData }) => {
                        return (
                          <Dropdown
                            search
                            placeholder="Select Frameworks"
                            selection
                            multiple
                            clearable
                            allowAdditions
                            onAddItem={(_e, { value: name }) => {
                              setData({ name } as {
                                name: string;
                              });
                              open();
                            }}
                            onLabelClick={(
                              _e,
                              { value: id, content: name }
                            ) => {
                              setData({ id, name } as {
                                id: string;
                                name: string;
                              });
                              open();
                            }}
                            disabled={loading}
                            loading={loading}
                            options={
                              options
                                ? options.frameworks.map(
                                    ({ name: text, id: value }, key) => ({
                                      key,
                                      text,
                                      value,
                                    })
                                  )
                                : []
                            }
                            onChange={(_e, { value }) =>
                              setFieldValue("frameworks", value)
                            }
                            value={values.frameworks}
                          />
                        );
                      }}
                    >
                      {({ data, close }) => {
                        if (data) {
                          return (
                            <FrameworkModal
                              id={data.id}
                              name={data.name}
                              close={close}
                              refetch={() => {
                                refetchGetGitRepoData();
                                refetchOptions();
                              }}
                            />
                          );
                        }

                        return null;
                      }}
                    </Modal>
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Libraries</Label>
                    <Modal<{ id?: string; name: string }>
                      openOnClick={false}
                      headerBody={({ data }) => {
                        return <Header>{data && data.name}</Header>;
                      }}
                      trigger={({ open, setData }) => {
                        return (
                          <Dropdown
                            search
                            placeholder="Select Libraries"
                            selection
                            multiple
                            clearable
                            allowAdditions
                            onAddItem={(_e, { value: name }) => {
                              setData({ name } as {
                                name: string;
                              });
                              open();
                            }}
                            onLabelClick={(
                              _e,
                              { value: id, content: name }
                            ) => {
                              setData({ id, name } as {
                                id: string;
                                name: string;
                              });
                              open();
                            }}
                            disabled={loading}
                            loading={loading}
                            options={
                              options
                                ? options.libraries.map(
                                    ({ name: text, id: value }, key) => ({
                                      key,
                                      text,
                                      value,
                                    })
                                  )
                                : []
                            }
                            onChange={(_e, { value }) =>
                              setFieldValue("libraries", value)
                            }
                            value={values.libraries}
                          />
                        );
                      }}
                    >
                      {({ data, close }) => {
                        if (data)
                          return (
                            <LibraryModal
                              name={data.name}
                              id={data.id}
                              close={close}
                              refetch={() => {
                                refetchGetGitRepoData();
                                refetchOptions();
                              }}
                            />
                          );

                        return null;
                      }}
                    </Modal>
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Environments</Label>
                    <Modal<{ id?: string; name: string }>
                      openOnClick={false}
                      headerBody={({ data }) => {
                        return <Header>{data && data.name}</Header>;
                      }}
                      trigger={({ setData, open }) => {
                        return (
                          <Dropdown
                            search
                            placeholder="Select Environments"
                            selection
                            clearable
                            allowAdditions
                            onAddItem={(_e, { value: name }) => {
                              setData({ name } as {
                                name: string;
                              });
                              open();
                            }}
                            onLabelClick={(
                              _e,
                              { value: id, content: name }
                            ) => {
                              setData({ id, name } as {
                                id: string;
                                name: string;
                              });
                              open();
                            }}
                            multiple
                            disabled={loading}
                            loading={loading}
                            options={
                              options
                                ? options.environments.map(
                                    ({ name: text, id: value }, key) => ({
                                      key,
                                      text,
                                      value,
                                    })
                                  )
                                : []
                            }
                            onChange={(_e, { value }) =>
                              setFieldValue("environments", value)
                            }
                            value={values.environments}
                          />
                        );
                      }}
                    >
                      {({ data, close }) => {
                        if (data) {
                          return (
                            <EnvironmentModal
                              id={data.id}
                              name={data.name}
                              close={close}
                              refetch={() => {
                                refetchGetGitRepoData();
                                refetchOptions();
                              }}
                            />
                          );
                        }

                        return null;
                      }}
                    </Modal>
                  </Form.Field>
                  <Divider />
                  <Form.Button
                    type="submit"
                    primary
                    loading={loading}
                    disabled={loading}
                  >
                    {update ? "Update" : "Publish"}
                  </Form.Button>
                  {user &&
                  gitRepoData &&
                  gitRepoData.gitRepo &&
                  gitRepoData.gitRepo.template &&
                  (user.admin ||
                    gitRepoData.gitRepo.template.owner.id === user.id ||
                    owner.id === user.id) ? (
                    <ConfirmModal
                      onConfirm={async () => {
                        if (
                          gitRepoData.gitRepo &&
                          gitRepoData.gitRepo.template
                        ) {
                          await removeTemplate({
                            variables: {
                              id: gitRepoData.gitRepo.template.id,
                            },
                          });

                          await refetchGetGitRepoData();
                        } else {
                          throw new Error("NOT VALID TEMPLATE");
                        }
                      }}
                      content={`Are you sure you want to remove the template "${gitRepoData.gitRepo.template.name}"`}
                      header="Remove Template"
                      confirmButton={
                        <Button negative>Yes, remove template</Button>
                      }
                    >
                      <Form.Button
                        negative
                        onClick={e => {
                          e.preventDefault();
                        }}
                        loading={loading}
                        disabled={loading}
                      >
                        Remove Template
                      </Form.Button>
                    </ConfirmModal>
                  ) : null}
                </Form>
              </Grid.Row>
            </>
          );
        }}
      </Formik>
    ),
    [loading, initialValues, update]
  );

  return (
    <Grid centered>
      <Grid.Row>
        <Flex alignItems="center">
          <Label color="blue">Repository Data</Label>
          {update && (
            <>
              <Checkbox
                onChange={() => setToggleFormData(!toggleFormData)}
                checked={toggleFormData}
                slider
              />
              <Label color="blue">Template Data</Label>
            </>
          )}
        </Flex>
      </Grid.Row>
      {MemoizedFormik}
    </Grid>
  );
};

export default RepositoryPublishModalContent;
