import { FC } from "react";

const RepositoryPublishModalContent: FC<{
  children: {
    name: string;
  };
}> = ({ children: { name } }) => {
  return <div>Publish {name}</div>;
};

export default RepositoryPublishModalContent;
