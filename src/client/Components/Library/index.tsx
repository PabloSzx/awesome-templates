import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Form, Input, Label, TextArea } from "semantic-ui-react";

import LanguagesDropdown from "../Languages/Dropdown";

type ILibraryData = {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  language?: {
    name: string;
  };
};
const LibraryModal: FC<{ id?: string; name: string; close: () => void }> = ({
  id,
  name,
  close,
}) => {
  const { data, loading: loadingLibraryData } = useQuery<
    { library: ILibraryData | null },
    { id: string }
  >(
    gql`
      query($id: String!) {
        library(id: $id) {
          id
          name
          url
          logoUrl
          description
          language {
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
  const [createLibrary, { loading: loadingCreateLibrary }] = useMutation<
    {},
    {
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
      language?: string;
    }
  >(gql`
    mutation(
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
      $language: String
    ) {
      createLibrary(
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
        language: $language
      ) {
        id
        name
        url
        logoUrl
        description
        language {
          name
        }
      }
    }
  `);

  const [updateLibrary, { loading: loadingUpdateLibrary }] = useMutation<
    {},
    {
      id: string;
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
      language?: string;
    }
  >(gql`
    mutation(
      $id: String!
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
      $language: String
    ) {
      updateLibrary(
        id: $id
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
        language: $language
      ) {
        id
        name
        url
        logoUrl
        description
        language {
          name
        }
      }
    }
  `);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tempLoading =
      loadingCreateLibrary || loadingLibraryData || loadingUpdateLibrary;
    if (tempLoading !== loading) {
      setLoading(tempLoading);
    }
  }, [loadingCreateLibrary, loadingLibraryData, loadingUpdateLibrary]);

  const [update, setUpdate] = useState(!!id);

  const [initialValues, setInitialValues] = useState({
    name,
    url: "",
    logoUrl: "",
    description: "",
    language: "",
  });

  useEffect(() => {
    if (!loadingLibraryData && data && data.library) {
      const { name, url, logoUrl, description, language } = data.library;
      setUpdate(true);
      setInitialValues({
        name,
        url: url || "",
        logoUrl: logoUrl || "",
        description: description || "",
        language: language ? language.name : "",
      });
    }
  }, [data, loadingLibraryData]);

  return useMemo(
    () => (
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async ({ name, url, logoUrl, description, language }) => {
          if (id && update && data && data.library) {
            await updateLibrary({
              variables: {
                id,
                name,
                url: url || undefined,
                logoUrl: logoUrl || undefined,
                description: description || undefined,
                language: language || undefined,
              },
            });
          } else {
            await createLibrary({
              variables: {
                name,
                url: url || undefined,
                logoUrl: logoUrl || undefined,
                description: description || undefined,
                language: language || undefined,
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
              <Label color="grey">Language</Label>
              <LanguagesDropdown
                clearable
                selection
                search
                disabled={loading}
                loading={loading}
                onChange={value => setFieldValue("language", value)}
                value={values.language}
                multiple={false}
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
                {update ? "Update Library" : "Add Library"}
              </Form.Button>
            </Form.Field>
          </Form>
        )}
      </Formik>
    ),
    [loading, initialValues, update]
  );
};

export default LibraryModal;
