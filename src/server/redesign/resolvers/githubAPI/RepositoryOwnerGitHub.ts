import gql from "graphql-tag";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";

import { GitHubAPI } from "../../../../utils";
import { APILevel } from "../../../consts";
import { IContext } from "../../../interfaces";
import { GitHubOrganization, GitHubUser, RepositoryOwnerGitHub } from "../../entities";

@Resolver(() => RepositoryOwnerGitHub)
export class RepositoryOwnerGitHubResolver {
  @Authorized(APILevel.ADVANCED)
  @Query(() => RepositoryOwnerGitHub, { nullable: true })
  async repositoryOwner(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("id") id: string
  ): Promise<RepositoryOwnerGitHub | null> {
    const {
      data: { node },
    } = await GitHubAPI.query<
      {
        node:
          | { __typename: "User" } & GitHubUser
          | { __typename: "Organization" } & GitHubOrganization
          | null;
      },
      { id: string }
    >({
      query: gql`
        query($id: ID!) {
          node(id: $id)
          __typename
          ... on User {
            id
            avatarUrl
            login
            url
            email
            name
            bio
          }
          ... on Organization {
            id
            avatarUrl
            login
            url
            email
            name
            description
            websiteUrl
          }
        }
      `,
      variables: {
        id,
      },
      context,
    });

    if (node) {
      const { id, avatarUrl, login, url, email, name } = node;
      switch (node.__typename) {
        case "User":
          return {
            id,
            avatarUrl,
            login,
            url,
            repositories: [],
            user: {
              id,
              avatarUrl,
              login,
              url,
              email: email || "",
              name,
              bio: node.bio,
              repositories: [],
              starredRepositories: [],
              organizations: [],
            },
          };
        case "Organization":
          return {
            id,
            avatarUrl,
            login,
            url,
            repositories: [],
            organization: {
              id,
              avatarUrl,
              login,
              url,
              email,
              name,
              description: node.description,
              websiteUrl: node.websiteUrl,
              members: [],
              repositories: [],
            },
          };
        default:
      }
    }

    return null;
  }
}
