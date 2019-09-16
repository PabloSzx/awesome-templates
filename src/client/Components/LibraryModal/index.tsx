import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useEffect, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Button, Dropdown, Form, Input, Label, TextArea } from "semantic-ui-react";

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
  const { data: dataLanguages, loading: loadingLanguages } = useQuery<{
    languages: { name: string }[];
  }>(gql`
    query {
      languages {
        name
      }
    }
  `);
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
    {
      createLibrary: ILibraryData[];
    },
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
    {
      updateLibrary: ILibraryData[];
    },
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
    setLoading(
      loadingCreateLibrary ||
        loadingLibraryData ||
        loadingUpdateLibrary ||
        loadingLanguages
    );
  }, [
    loadingCreateLibrary,
    loadingLibraryData,
    loadingUpdateLibrary,
    loadingLanguages,
  ]);

  const [update, setUpdate] = useState(false);

  const [initialValues, setInitialValues] = useState({
    name,
    url: "" as string | undefined,
    logoUrl: "" as string | undefined,
    description: "" as string | undefined,
    language: "" as string | undefined,
  });

  useEffect(() => {
    if (!loadingLibraryData && data && data.library) {
      setUpdate(true);
      setInitialValues({
        name: data.library.name,
        url: data.library.url || "",
        logoUrl: data.library.logoUrl || "",
        description: data.library.description || "",
        language: data.library.language ? data.library.language.name : "",
      });
    }
  }, [data, loadingLibraryData]);

  return (
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
              onChange={(_e, { value }) => setFieldValue("description", value)}
              disabled={loading}
              rows={3}
            />
          </Form.Field>
          <Form.Field>
            <Label color="grey">Language</Label>
            <Dropdown
              clearable
              selection
              search
              placeholder="Select language"
              options={
                dataLanguages
                  ? dataLanguages.languages.map(({ name: value }, key) => ({
                      key,
                      text: value,
                      value,
                    }))
                  : []
              }
              onChange={(_e, { value }) => setFieldValue("language", value)}
              value={values.language}
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
              {update ? "Update Library" : "Add Library"}
            </Form.Button>
          </Form.Field>
        </Form>
      )}
    </Formik>
  );
};

export default LibraryModal;
