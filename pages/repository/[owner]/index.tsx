import _ from "lodash";
import { NextPage } from "next";

const OwnerRepositories: NextPage<{ owner: string }> = ({ owner }) => {
  return <div>{owner}</div>;
};

OwnerRepositories.getInitialProps = async ({ query: { owner } }) => {
  if (_.isString(owner)) {
    return { owner };
  }

  throw new Error("Error given owner");
};

export default OwnerRepositories;
