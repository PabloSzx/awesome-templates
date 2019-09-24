import _ from "lodash";
import { NextPage } from "next";

const RepositoryPage: NextPage<{ owner: string; name: string }> = ({
  owner,
  name,
}) => {
  return (
    <div>
      {owner}/{name}
    </div>
  );
};

RepositoryPage.getInitialProps = async ({ query: { owner, name } }) => {
  if (_.isString(name) && _.isString(owner)) {
    return { owner, name };
  }

  throw new Error("Owner and name given wrong");
};

export default RepositoryPage;
