import { Field, ObjectType } from "type-graphql";

import { GitHubRepositoryOwner } from "../types/GitHubRepositoryOwner";
import { OrganizationGitHub } from "./OrganizationGitHub";
import { RepositoryGitHub } from "./RepositoryGitHub";
import { UserGitHubAPI } from "./UserGitHubAPI";

@ObjectType()
export class RepositoryOwnerGitHub implements GitHubRepositoryOwner {
  @Field()
  id: string;

  @Field()
  avatarUrl: string;

  @Field()
  login: string;

  @Field()
  url: string;

  @Field(() => UserGitHubAPI, { nullable: true })
  user?: UserGitHubAPI;

  @Field(() => OrganizationGitHub, { nullable: true })
  organization?: OrganizationGitHub;

  /**
   * There is no point requesting this API field here (hence no @Field decorator), since it would be
   * just duplicating code, and you can request the same info inside "user" and "organization"
   */
  repositories: RepositoryGitHub[];
}
