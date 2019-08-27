import { createUnionType } from "type-graphql";

import { Organization, UserGitHub } from "../../entities";

export const RepositoryOwnerUnion = createUnionType({
  name: "RepositoryOwnerUnion",
  types: [UserGitHub, Organization],
});
