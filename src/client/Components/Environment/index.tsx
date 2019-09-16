import gql from "graphql-tag";
import { FC, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-apollo";

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
    { createEnvironment: IEnvironmentData[] },
    {
      name: string;
      url?: string;
      logoUrl?: string;
      description?: string;
    }
  >(gql`
    mutation($name: String!, $url: String, logoUrl: String, description: String) {
      createEnvironment(name: $name, url: $url, logoUrl: $logoUrl, description: $description) {
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
    { updateEnvironment: IEnvironmentData[] },
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
    url: "" as string | undefined,
    logoUrl: "" as string | undefined,
    description: "" as string | undefined,
  });

  useEffect(() => {
    if (!loadingEnvironmentData && data && data.environment) {
      setUpdate(true);
      setInitialValues({
        name: data.environment.name,
        url: data.environment.url || "",
        logoUrl: data.environment.logoUrl || "",
        description: data.environment.description || "",
      });
    }
  }, [data, loadingEnvironmentData]);

  return useMemo(() => <div>hello world</div>, [
    loading,
    initialValues,
    update,
  ]);
};

export default EnvironmentModal;
