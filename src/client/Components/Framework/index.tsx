import { FC } from "react";

const FrameworkModal: FC<{
  id?: string;
  name: string;
  close: () => void;
}> = () => {
  return <div>hello world framework</div>;
};

export default FrameworkModal;
