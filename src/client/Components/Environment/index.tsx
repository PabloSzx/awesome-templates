import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Form, Input, Label, TextArea } from "semantic-ui-react";

type IEnvironmentData = {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
};

const EnvironmentModal: FC<{
  id?: string;
  name: string;
  close: () => void;
}> = ({ id, name, close }) => {
  const { data, loading: loadingEnvironmentData } = useQuery<
    {
      environment: IEnvironmentData | null;
    },
    {
      id: string;
    }
  >(
    gql`
      query($id: String!) {
        environment(id: $id) {
          id
          name
          url
          logoUrl
          description
        }
      }
    `,
    {
      skip: !id,
      variables: {
        id: id as string,
      },
    }
  );

  const [
    createEnvironment,
    { loading: loadingCreateEnvironment },
  ] = useMutation<
    {},
    {
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
    }
  >(gql`
    mutation(
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
    ) {
      createEnvironment(
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
      ) {
        id
        name
        url
        logoUrl
        description
      }
    }
  `);

  const [
    updateEnvironment,
    { loading: loadingUpdateEnvironment },
  ] = useMutation<
    {},
    {
      id: string;
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
    }
  >(gql`
    mutation(
      $id: String!
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
    ) {
      updateEnvironment(
        id: $id
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
      ) {
        id
        name
        url
        logoUrl
        description
      }
    }
  `);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tempLoading =
      loadingEnvironmentData ||
      loadingCreateEnvironment ||
      loadingUpdateEnvironment;

    if (tempLoading !== loading) {
      setLoading(tempLoading);
    }
  }, [
    loadingEnvironmentData,
    loadingCreateEnvironment,
    loadingEnvironmentData,
  ]);

  const [update, setUpdate] = useState(!!id);

  const [initialValues, setInitialValues] = useState({
    name,
    url: "",
    logoUrl: "",
    description: "",
  });

  useEffect(() => {
    if (!loadingEnvironmentData && data && data.environment) {
      const { name, url, logoUrl, description } = data.environment;
      setUpdate(true);
      setInitialValues({
        name,
        url: url || "",
        logoUrl: logoUrl || "",
        description: description || "",
      });
    }
  }, [data, loadingEnvironmentData]);

  return useMemo(
    () => (
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async ({ name, url, logoUrl, description }) => {
          if (id && update) {
            await updateEnvironment({
              variables: {
                id,
                name,
                url: url || undefined,
                logoUrl: logoUrl || undefined,
                description: description || undefined,
              },
            });
          } else {
            await createEnvironment({
              variables: {
                name,
                url: url || undefined,
                logoUrl: logoUrl || undefined,
                description: description || undefined,
              },
            });
          }
          close();
        }}
      >
        {({ values, setFieldValue, handleSubmit }) => (
          <Form>
            <Form.Field>
              <Label color="grey">Name</Label>
              <Input
                name="name"
                value={values.name}
                onChange={(_e, { value }) => setFieldValue("name", value)}
                disabled={loading}
                loading={loading}
              />
            </Form.Field>
            <Form.Field>
              <Label color="grey">URL</Label>
              <Input
                name="url"
                value={values.url}
                onChange={(_e, { value }) => setFieldValue("url", value)}
                disabled={loading}
                loading={loading}
              />
            </Form.Field>
            <Form.Field>
              <Label color="grey">Logo URL</Label>
              <Input
                name="logoUrl"
                value={values.logoUrl}
                onChange={(_e, { value }) => setFieldValue("logoUrl", value)}
                disabled={loading}
                loading={loading}
              />
            </Form.Field>
            <Form.Field>
              <Label color="grey">Description</Label>
              <TextArea
                name="description"
                value={values.description}
                onChange={(_e, { value }) =>
                  setFieldValue("description", value)
                }
                disabled={loading}
                rows={3}
              />
            </Form.Field>
            <Form.Field>
              <Form.Button
                type="submit"
                onClick={ev => {
                  ev.preventDefault();
                  handleSubmit();
                }}
                disabled={loading}
                loading={loading}
                primary
              >
                {update ? "Update Environment" : "Add Environment"}
              </Form.Button>
            </Form.Field>
          </Form>
        )}
      </Formik>
    ),
    [loading, initialValues, update]
  );
};

export default EnvironmentModal;
