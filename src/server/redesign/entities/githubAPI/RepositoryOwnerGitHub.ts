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

  repositories: RepositoryGitHub[];
}
