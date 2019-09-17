import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-apollo";
import { Button, Form, Input, Label, TextArea } from "semantic-ui-react";

import { AuthContext } from "../Auth/Context";
import LanguagesDropdown from "../Languages/Dropdown";
import ConfirmModal from "../Modal/Confirm";

type IFrameworkData = {
  id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  languages: {
    name: string;
  }[];
  creator: {
    id: string;
  };
};
const FrameworkModal: FC<{
  id?: string;
  name: string;
  close: () => void;
  refetch: () => void;
}> = ({ id, name, close, refetch }) => {
  const { user } = useContext(AuthContext);
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
          creator {
            id
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
  const [
    createFramework,
    { loading: loadingCreateFramework, called: calledCreateFramework },
  ] = useMutation<
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
        creator {
          id
        }
      }
    }
  `);

  const [
    updateFramework,
    { loading: loadingUpdateFramework, called: calledUpdateFramework },
  ] = useMutation<
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
        creator {
          id
        }
      }
    }
  `);

  const [
    removeFramework,
    { loading: loadingRemoveFramework, called: calledRemoveFramework },
  ] = useMutation<
    { removeFramework: string },
    {
      id: string;
    }
  >(gql`
    mutation($id: String!) {
      removeFramework(id: $id)
    }
  `);

  const loading =
    loadingCreateFramework ||
    loadingFrameworkData ||
    loadingUpdateFramework ||
    loadingRemoveFramework;

  useEffect(() => {
    if (
      (calledCreateFramework && !loadingCreateFramework) ||
      (calledUpdateFramework && !loadingUpdateFramework) ||
      (calledRemoveFramework && !loadingRemoveFramework)
    ) {
      refetch();
    }
  }, [
    calledCreateFramework,
    calledUpdateFramework,
    calledRemoveFramework,
    loadingCreateFramework,
    loadingUpdateFramework,
    loadingRemoveFramework,
  ]);

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
            {user &&
              id &&
              data &&
              data.framework &&
              (user.admin || data.framework.creator.id === user.id) && (
                <ConfirmModal
                  onConfirm={async () => {
                    await removeFramework({
                      variables: {
                        id,
                      },
                    });
                    close();
                  }}
                  content={`Are you sure you want to remove the framework "${name}"`}
                  header="Remove Framework"
                  confirmButton={
                    <Button negative>Yes, remove framework</Button>
                  }
                >
                  <Form.Field>
                    <Form.Button
                      negative
                      onClick={async e => {
                        e.preventDefault();
                      }}
                      loading={loading}
                      disabled={loading}
                    >
                      Remove Framework
                    </Form.Button>
                  </Form.Field>
                </ConfirmModal>
              )}
          </Form>
        )}
      </Formik>
    ),
    [loading, initialValues, update]
  );
};

export default FrameworkModal;
