import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Button, Form, Input, Label, TextArea } from "semantic-ui-react";

import LanguagesDropdown from "../Languages/Dropdown";

type IFrameworkData = {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  languages: {
    name: string;
  }[];
};
const FrameworkModal: FC<{ id?: string; name: string; close: () => void }> = ({
  id,
  name,
  close,
}) => {
  const { data, loading: loadingFrameworkData } = useQuery<
    { framework: IFrameworkData | null },
    { id: string }
  >(
    gql`
      query($id: String!) {
        framework(id: $id) {
          id
          name
          url
          logoUrl
          description
          languages {
            name
          }
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
  const [createFramework, { loading: loadingCreateFramework }] = useMutation<
    {},
    {
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
      languages: string[];
    }
  >(gql`
    mutation(
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
      $languages: [String!]!
    ) {
      createFramework(
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
        languages: $languages
      ) {
        id
        name
        url
        logoUrl
        description
        languages {
          name
        }
      }
    }
  `);

  const [updateFramework, { loading: loadingUpdateFramework }] = useMutation<
    {},
    {
      id: string;
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
      languages: string[];
    }
  >(gql`
    mutation(
      $id: String!
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
      $languages: [String!]!
    ) {
      updateFramework(
        id: $id
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
        languages: $languages
      ) {
        id
        name
        url
        logoUrl
        description
        languages {
          name
        }
      }
    }
  `);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tempLoading =
      loadingCreateFramework || loadingFrameworkData || loadingUpdateFramework;
    if (tempLoading !== loading) {
      setLoading(tempLoading);
    }
  }, [loadingCreateFramework, loadingFrameworkData, loadingUpdateFramework]);

  const [update, setUpdate] = useState(!!id);

  const [initialValues, setInitialValues] = useState({
    name,
    url: "",
    logoUrl: "",
    description: "",
    languages: [] as string[],
  });

  useEffect(() => {
    if (!loadingFrameworkData && data && data.framework) {
      const { name, url, logoUrl, description, languages } = data.framework;
      setUpdate(true);
      setInitialValues({
        name: name,
        url: url || "",
        logoUrl: logoUrl || "",
        description: description || "",
        languages: languages.map(({ name }) => name),
      });
    }
  }, [data, loadingFrameworkData]);

  return useMemo(
    () => (
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async ({ name, url, logoUrl, description, languages }) => {
          if (id && update) {
            await updateFramework({
              variables: {
                id,
                name,
                url: url || undefined,
                logoUrl: logoUrl || undefined,
                description: description || undefined,
                languages,
              },
            });
          } else {
            await createFramework({
              variables: {
                name,
                url: url || undefined,
                logoUrl: logoUrl || undefined,
                description: description || undefined,
                languages,
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
              <Label color="grey">Languages</Label>
              <LanguagesDropdown
                onChange={value => setFieldValue("languages", value)}
                value={values.languages}
                clearable
                selection
                search
                multiple
                disabled={loading}
                loading={loading}
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
                {update ? "Update Framework" : "Add Framework"}
              </Form.Button>
            </Form.Field>
          </Form>
        )}
      </Formik>
    ),
    [loading, initialValues, update]
  );
};

export default FrameworkModal;
