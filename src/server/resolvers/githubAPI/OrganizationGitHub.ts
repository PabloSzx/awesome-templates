import gql from "graphql-tag";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../../utils";
import { APILevel } from "../../consts";
import {
    GitHubOrganization, GitHubRepository, GitHubUser, Organization, OrganizationGitHub,
    RepositoryOwner
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => OrganizationGitHub)
export class OrganizationGitHubResolver {
  constructor(
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>,
    @InjectRepository(RepositoryOwner)
    private readonly RepositoryOwnerRepository: Repository<RepositoryOwner>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(() => OrganizationGitHub, { nullable: true })
  async organization(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("login") login: string
  ) {
    const {
      data: { organization },
    } = await GitHubAPI.query<
      {
        organization: GitHubOrganization | null;
      },
      {
        login: string;
      }
    >({
      query: gql`
        query organization($login: String!) {
          organization(login: $login) {
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
        login,
      },
      context,
    });

    if (organization) {
      this.OrganizationRepository.save(organization);
      this.RepositoryOwnerRepository.save({
        ...organization,
        organization,
      });
    }

    return organization;
  }

  @FieldResolver()
  async members(
    @Ctx() { authGitHub: context }: IContext,
    @Root() { login, id }: GitHubOrganization
  ) {
    let after: string | undefined;
    let hasNextPage: boolean;

    let members: GitHubUser[] = [];

    do {
      const {
        data: { organization },
      } = await GitHubAPI.query<
        {
          organization: {
            membersWithRole: {
              pageInfo: {
                endCursor: string | undefined;
                hasNextPage: boolean;
              };
              nodes: Array<GitHubUser>;
            };
          };
        },
        {
          login: string;
          after: string | undefined;
        }
      >({
        query: gql`
          query($login: String!, $after: String) {
            organization(login: $login) {
              id
              membersWithRole(first: 100, after: $after) {
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  id
                  avatarUrl
                  login
                  url
                  email
                  name
                  bio
                }
              }
            }
          }
        `,
        variables: {
          login,
          after,
        },
        context,
      });

      members.push(...organization.membersWithRole.nodes);
      after = organization.membersWithRole.pageInfo.endCursor;
      hasNextPage = organization.membersWithRole.pageInfo.hasNextPage;
    } while (hasNextPage);
    this.OrganizationRepository.save({ id, members });

    return members;
  }

  @FieldResolver()
  async repositories(
    @Ctx() { authGitHub: context }: IContext,
    @Root() { login, id }: GitHubOrganization,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
    isTemplate: boolean
  ) {
    let after: string | undefined;
    let hasNextPage: boolean;

    let repositories: GitHubRepository[] = [];

    do {
      const {
        data: {
          organization: {
            repositories: { nodes, pageInfo },
          },
        },
      } = await GitHubAPI.query<
        {
          organization: {
            repositories: {
              pageInfo: {
                endCursor: string | undefined;
                hasNextPage: boolean;
              };
              nodes: Array<GitHubRepository>;
            };
          };
        },
        {
          login: string;
          after: string | undefined;
        }
      >({
        query: gql`
          query($login: String!, $after: String) {
            organization(login: $login) {
              id
              repositories(
                first: 100
                privacy: PUBLIC
                after: $after
                orderBy: { direction: DESC, field: STARGAZERS }
              ) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  id
                  createdAt
                  updatedAt
                  isLocked
                  isArchived
                  isDisabled
                  isFork
                  isTemplate
                  forkCount
                  name
                  nameWithOwner
                  primaryLanguage {
                    color
                    id
                    name
                  }
                  description
                  url

                  owner {
                    id
                    avatarUrl
                    login
                    url
                  }
                }
              }
            }
          }
        `,
        variables: {
          login,
          after,
        },
        context,
      });

      repositories.push(
        ..._.compact(
          _.map(nodes, repo => {
            if (
              repo &&
              repo.createdAt &&
              repo.updatedAt &&
              (isTemplate !== undefined ? repo.isTemplate === isTemplate : true)
            ) {
              return {
                ...repo,
                createdAt: new Date(repo.createdAt),
                updatedAt: new Date(repo.updatedAt),
              };
            }
            return undefined;
          })
        )
      );

      after = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    } while (hasNextPage);

    this.OrganizationRepository.save({ id, repositories });

    return repositories;
  }
}
