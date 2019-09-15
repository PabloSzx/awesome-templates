import { Field, Formik } from "formik";
import gql from "graphql-tag";
import { FC, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Flex } from "rebass";
import { Checkbox, Divider, Dropdown, Form, Grid, Input, Label } from "semantic-ui-react";

const RepositoryPublishModalContent: FC<{
  children: {
    name: string;
    id: string;
    languages: { name: string }[];
    primaryLanguage?: { name: string };
  };
}> = ({ children: { name, id, languages, primaryLanguage } }) => {
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
            name: string;
          }[];
          frameworks: {
            name: string;
          }[];
          environments: {
            name: string;
          }[];
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
              name
            }
            frameworks {
              name
            }
            environments {
              name
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

  const { data: options } = useQuery<{
    languages: { name: string }[];
    libraries: { name: string }[];
    frameworks: { name: string }[];
    environments: { name: string }[];
  }>(gql`
    query {
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
  `);
  const [
    createTemplate,
    { called: calledCreateTemplate, loading: loadingCreateTemplate },
  ] = useMutation<
    any,
    {
      repositoryId: string;
      name: string;
      primaryLanguage?: string;
      languages?: string[];
      frameworks?: string[];
      libraries?: string[];
      environments?: string[];
    }
  >(
    gql`
      mutation(
        $repositoryId: String!
        $name: String!
        $primaryLanguage: String
        $languages: [String!]
        $frameworks: [String!]
        $libraries: [String!]
        $environments: [String!]
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
      }
    `,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  const [
    updateTemplate,
    {
      data: dataUpdatedTemplate,
      loading: loadingUpdatingTemplate,
      called: calledUpdateTemplate,
    },
  ] = useMutation<
    { id: string; name: string },
    {
      templateId: string;
      repositoryId?: string;
      name?: string;
      primaryLanguage?: string;
      languages?: string[];
      frameworks?: string[];
      libraries?: string[];
      environments?: string[];
    }
  >(
    gql`
      mutation(
        $templateId: String!
        $repositoryId: String
        $name: String
        $primaryLanguage: String
        $languages: [String!]
        $frameworks: [String!]
        $libraries: [String!]
        $environments: [String!]
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
      }
    `,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (
      (!loadingCreateTemplate && calledCreateTemplate) ||
      (!loadingUpdatingTemplate && calledUpdateTemplate)
    ) {
      refetchGetGitRepoData();
    }
  }, [
    calledCreateTemplate,
    calledUpdateTemplate,
    loadingCreateTemplate,
    loadingUpdatingTemplate,
  ]);

  const [update, setUpdate] = useState(false);

  useEffect(() => {
    if (gitRepoData && gitRepoData.gitRepo && gitRepoData.gitRepo.template) {
      setUpdate(true);
    }
  }, [gitRepoData]);

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
    if (gitRepoData && gitRepoData.gitRepo && gitRepoData.gitRepo.template) {
      setToggleFormData(true);
    }
  }, [gitRepoData]);

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
        frameworks: frameworks.map(({ name }) => name),
        libraries: libraries.map(({ name }) => name),
        environments: environments.map(({ name }) => name),
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

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(
      loadingCreateTemplate || loadingGetRepoData || loadingUpdatingTemplate
    );
  }, [loadingCreateTemplate, loadingGetRepoData, loadingUpdatingTemplate]);

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
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async values => {
          try {
            if (
              gitRepoData &&
              gitRepoData.gitRepo &&
              gitRepoData.gitRepo.template
            ) {
              const { data, errors } = await updateTemplate({
                variables: {
                  ...values,
                  templateId: gitRepoData.gitRepo.template.id,
                },
              });

              if (errors) {
                console.log("errors2", errors);
              }

              console.log("data1", data);
            } else {
              const { data, errors } = await createTemplate({
                variables: { ...values, repositoryId: id },
              });

              if (errors) {
                console.log("errors2", errors);
              }

              console.log("data2", data);
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
                    <Dropdown
                      search
                      placeholder="Select Frameworks"
                      selection
                      multiple
                      clearable
                      loading={loading}
                      options={
                        options
                          ? options.frameworks.map(({ name: value }, key) => ({
                              key,
                              text: value,
                              value,
                            }))
                          : []
                      }
                      onChange={(_e, { value }) =>
                        setFieldValue("frameworks", value)
                      }
                      value={values.frameworks}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Libraries</Label>
                    <Dropdown
                      search
                      placeholder="Select Libraries"
                      selection
                      multiple
                      clearable
                      loading={loading}
                      options={
                        options
                          ? options.libraries.map(({ name: value }, key) => ({
                              key,
                              text: value,
                              value,
                            }))
                          : []
                      }
                      onChange={(_e, { value }) =>
                        setFieldValue("libraries", value)
                      }
                      value={values.libraries}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Environments</Label>
                    <Dropdown
                      search
                      placeholder="Select Environments"
                      selection
                      clearable
                      multiple
                      loading={loading}
                      options={
                        options
                          ? options.environments.map(
                              ({ name: value }, key) => ({
                                key,
                                text: value,
                                value,
                              })
                            )
                          : []
                      }
                      onChange={(_e, { value }) =>
                        setFieldValue("environment", value)
                      }
                      value={values.environments}
                    />
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
                </Form>
              </Grid.Row>
            </>
          );
        }}
      </Formik>
    </Grid>
  );
};

export default RepositoryPublishModalContent;
