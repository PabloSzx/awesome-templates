import { Formik } from "formik";
import gql from "graphql-tag";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { Button, Form, Input, Label, TextArea } from "semantic-ui-react";

import { useMutation, useQuery } from "@apollo/react-hooks";

import { AuthContext } from "../Auth/Context";
import ConfirmModal from "../Modal/Confirm";

type IEnvironmentData = {
  _id: string;
  name: string;
  url?: string;
  logoUrl?: string;
  description?: string;
  creator: {
    id: string;
  };
};

const EnvironmentModal: FC<{
  _id?: string;
  name: string;
  close: () => void;
  refetch: () => void;
}> = ({ _id, name, close, refetch }) => {
  const { user } = useContext(AuthContext);

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
          _id
          name
          url
          logoUrl
          description
          creator {
            id
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
    createEnvironment,
    { loading: loadingCreateEnvironment, called: calledCreateEnvironment },
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
        _id
        name
        url
        logoUrl
        description
        creator {
          id
        }
      }
    }
  `);

  const [
    updateEnvironment,
    { loading: loadingUpdateEnvironment, called: calledUpdateEnvironment },
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
        _id
        name
        url
        logoUrl
        description
        creator {
          _id
        }
      }
    }
  `);

  const [
    removeEnvironment,
    { loading: loadingRemoveEnvironment, called: calledRemoveEnvironment },
  ] = useMutation<
    { removeEnvironment: string },
    {
      id: string;
    }
  >(gql`
    mutation($id: String!) {
      removeEnvironment(id: $id)
    }
  `);

  const loading =
    loadingEnvironmentData ||
    loadingCreateEnvironment ||
    loadingUpdateEnvironment ||
    loadingRemoveEnvironment;

  useEffect(() => {
    if (
      (calledCreateEnvironment && !loadingCreateEnvironment) ||
      (calledUpdateEnvironment && !loadingUpdateEnvironment) ||
      (calledRemoveEnvironment && !loadingRemoveEnvironment)
    ) {
      refetch();
    }
  }, [
    calledCreateEnvironment,
    calledUpdateEnvironment,
    calledRemoveEnvironment,
    loadingCreateEnvironment,
    loadingUpdateEnvironment,
    loadingRemoveEnvironment,
  ]);

  const [update, setUpdate] = useState(!!_id);

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
          if (_id && update) {
            await updateEnvironment({
              variables: {
                id: _id,
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
            {user &&
              _id &&
              data &&
              data.environment &&
              (user.admin || data.environment.creator.id === user._id) && (
                <ConfirmModal
                  onConfirm={async () => {
                    await removeEnvironment({
                      variables: {
                        id: _id,
                      },
                    });
                    close();
                  }}
                  content={`Are you sure you want to remove the environment "${name}"`}
                  header="Remove Environment"
                  confirmButton={
                    <Button negative>Yes, remove environment</Button>
                  }
                >
                  <Form.Field>
                    <Form.Button
                      onClick={async e => {
                        e.preventDefault();
                      }}
                      negative
                      loading={loading}
                      disabled={loading}
                    >
                      Remove Environment
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

export default EnvironmentModal;
