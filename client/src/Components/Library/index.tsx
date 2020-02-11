import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { Button, Form, Input, Label, TextArea } from "semantic-ui-react";

import { useMutation, useQuery } from "@apollo/react-hooks";

import { AuthContext } from "../Auth/Context";
import LanguagesDropdown from "../Languages/Dropdown";
import ConfirmModal from "../Modal/Confirm";

type ILibraryData = {
  _id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  language?: {
    name: string;
  };
  creator: {
    id: string;
  };
};
const LibraryModal: FC<{
  _id?: string;
  name: string;
  close: () => void;
  refetch: () => void;
}> = ({ _id, name, close, refetch }) => {
  const { user } = useContext(AuthContext);
  const { data, loading: loadingLibraryData } = useQuery<
    { library: ILibraryData | null },
    { id: string }
  >(
    gql`
      query($id: ObjectId!) {
        library(id: $id) {
          _id
          name
          url
          logoUrl
          description
          language {
            _id
            name
          }
          creator {
            _id
          }
        }
      }
    `,
    {
      skip: !_id,
      variables: {
        id: _id as string,
      },
    }
  );
  const [
    createLibrary,
    { loading: loadingCreateLibrary, called: calledCreateLibrary },
  ] = useMutation<
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
        _id
        name
        url
        logoUrl
        description
        language {
          name
        }
        creator {
          _id
        }
      }
    }
  `);

  const [
    updateLibrary,
    { loading: loadingUpdateLibrary, called: calledUpdateLibrary },
  ] = useMutation<
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
      $id: ObjectId!
      $name: String!
      $url: String
      $logoUrl: String
      $description: String
      $language: ObjectId
    ) {
      updateLibrary(
        id: $id
        name: $name
        url: $url
        logoUrl: $logoUrl
        description: $description
        language: $language
      ) {
        _id
        name
        url
        logoUrl
        description
        language {
          name
        }
        creator {
          _id
        }
      }
    }
  `);

  const [
    removeLibrary,
    { loading: loadingRemoveLibrary, called: calledRemoveLibrary },
  ] = useMutation<{ removeLibrary: string }, { id: string }>(gql`
    mutation($id: ObjectId!) {
      removeLibrary(id: $id)
    }
  `);

  const loading =
    loadingCreateLibrary ||
    loadingLibraryData ||
    loadingUpdateLibrary ||
    loadingRemoveLibrary;

  useEffect(() => {
    if (
      (calledCreateLibrary && !loadingCreateLibrary) ||
      (calledUpdateLibrary && !loadingUpdateLibrary) ||
      (calledRemoveLibrary && !loadingRemoveLibrary)
    ) {
      refetch();
    }
  }, [
    calledCreateLibrary,
    calledUpdateLibrary,
    calledRemoveLibrary,
    loadingCreateLibrary,
    loadingUpdateLibrary,
    loadingRemoveLibrary,
  ]);

  const [update, setUpdate] = useState(!!_id);

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
          if (_id && update && data && data.library) {
            await updateLibrary({
              variables: {
                id: _id,
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
            {user &&
              _id &&
              data &&
              data.library &&
              (user.admin || data.library.creator.id === user._id) && (
                <Form.Field>
                  <ConfirmModal
                    onConfirm={async () => {
                      await removeLibrary({
                        variables: {
                          id: _id,
                        },
                      });
                      close();
                    }}
                    content={`Are you sure you want to remove library "${name}"`}
                    header="Remove Library"
                    confirmButton={
                      <Button negative>Yes, remove library</Button>
                    }
                  >
                    <Form.Button
                      negative
                      onClick={async e => {
                        e.preventDefault();
                      }}
                      disabled={loading}
                      loading={loading}
                    >
                      Remove Library
                    </Form.Button>
                  </ConfirmModal>
                </Form.Field>
              )}
          </Form>
        )}
      </Formik>
    ),
    [loading, initialValues, update]
  );
};

export default LibraryModal;
