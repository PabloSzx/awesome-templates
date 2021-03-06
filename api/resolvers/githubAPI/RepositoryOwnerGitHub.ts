import gql from "graphql-tag";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { APILevel } from "../../consts";
import {
    GitHubOrganization, GitHubRepositoryOwner, GitHubUser, RepositoryOwner, RepositoryOwnerGitHub
} from "../../entities";
import { IContext } from "../../interfaces";
import { GitHubAPI } from "../../utils";

@Resolver(() => RepositoryOwnerGitHub)
export class RepositoryOwnerGitHubResolver {
  constructor(
    @InjectRepository(RepositoryOwner)
    private readonly RepoOwnerRepository: Repository<RepositoryOwner>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(() => RepositoryOwnerGitHub, { nullable: true })
  async repositoryOwner(
    @Ctx() { authGitHub }: IContext,
    @Arg("id") id: string
  ) {
    let repoOwner: GitHubRepositoryOwner | undefined;
    let user: GitHubUser | undefined;
    let organization: GitHubOrganization | undefined;

    const { node } = await GitHubAPI.query<
      {
        node:
          | { __typename: "User" } & GitHubUser
          | { __typename: "Organization" } & GitHubOrganization
          | null;
      },
      { id: string }
    >(
      gql`
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
      authGitHub,
      {
        id,
      }
    );

    if (node) {
      const { id, avatarUrl, login, url, email, name } = node;
      repoOwner = {
        id,
        avatarUrl,
        login,
        url,
      };
      switch (node.__typename) {
        case "User":
          user = {
            id,
            avatarUrl,
            login,
            url,
            email: email || "",
            name,
            bio: node.bio,
          };
          break;
        case "Organization":
          organization = {
            id,
            avatarUrl,
            login,
            url,
            email,
            name,
            description: node.description,
            websiteUrl: node.websiteUrl,
          };
          break;
        default:
      }
    }

    if (repoOwner) {
      this.RepoOwnerRepository.save({
        ...repoOwner,
        user,
        organization,
      }).catch(err => {
        console.error(err);
      });
      return {
        ...repoOwner,
        user,
        organization,
      };
    }

    return null;
  }
}
