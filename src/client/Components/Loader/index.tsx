import { Loader } from "semantic-ui-react";
import styled from "styled-components";

const FullWindow = styled.div`
  width: 100vw;
  height: 100vh;
`;

export default ({ active = true }: { active?: boolean }) => (
  <FullWindow>
    <Loader active={active} />
  </FullWindow>
);
