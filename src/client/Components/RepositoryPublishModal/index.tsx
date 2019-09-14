import { Field, Formik } from "formik";
import gql from "graphql-tag";
import { FC } from "react";
import { useMutation, useQuery } from "react-apollo";
import { toast } from "react-toastify";
import { Button, Divider, Dropdown, Form, Grid, Header, Label } from "semantic-ui-react";

const RepositoryPublishModalContent: FC<{
  children: {
    name: string;
    id: string;
    languages: { name: string }[];
    primaryLanguage?: { name: string };
  };
}> = ({ children: { name, id, languages, primaryLanguage } }) => {
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
  const [createTemplate] = useMutation<
    { id: string; name: string },
    {
      repositoryId: string;
      name: string;
      primaryLanguage?: string;
      languages?: string[];
      frameworks?: string[];
      libraries?: string[];
      environment?: string[];
    }
  >(gql`
    mutation(
      $repositoryId: String!
      $name: String!
      $primaryLanguage: String
      $languages: [String!]
      $frameworks: [String!]
      $libraries: [String!]
      $environment: [String!]
    ) {
      createTemplate(
        name: $name
        repositoryId: $repositoryId
        primaryLanguage: $primaryLanguage
        languages: $languages
        frameworks: $frameworks
        libraries: $libraries
        environment: $environment
      ) {
        id
        name
      }
    }
  `);
  return (
    <Grid>
      <Grid.Row>
        <Header>{name}</Header>
      </Grid.Row>
      <Formik
        initialValues={{
          name,
          languages: languages.map(v => v.name),
          primaryLanguage: primaryLanguage ? primaryLanguage.name : undefined,
          frameworks: [] as string[],
          libraries: [] as string[],
          environment: [] as string[],
        }}
        onSubmit={async (values, actions) => {
          console.log("values", values);
          console.log("actions", actions);
          try {
            const { data, errors } = await createTemplate({
              variables: { ...values, repositoryId: id },
            });

            if (errors) {
              toast.error(errors.map(v => v.message).join());
            }
            toast.success(toast.success(JSON.stringify(data)));
          } catch (err) {
            toast.error(err.message);
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
                    <Field
                      type="text"
                      name="name"
                      placeholder="Template Name"
                    />
                  </Form.Field>
                  <Form.Field>
                    <Label color="grey">Primary Language</Label>
                    <Dropdown
                      placeholder="Select the primary language"
                      search
                      selection
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
                      value={values.environment}
                    />
                  </Form.Field>
                  <Divider />
                  <Form.Button type="submit" primary>
                    Publicar
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
