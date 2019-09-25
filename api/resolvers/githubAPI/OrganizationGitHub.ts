import gql from "graphql-tag";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { APILevel } from "../../consts";
import {
    GitHubOrganization, GitHubRepository, GitHubUser, Organization, OrganizationGitHub,
    RepositoryOwner
} from "../../entities";
import { IContext } from "../../interfaces";
import { GitHubAPI } from "../../utils";

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
    @Ctx() { authGitHub }: IContext,
    @Arg("login") login: string
  ) {
    const { organization } = await GitHubAPI.query<
      {
        organization: GitHubOrganization | null;
      },
      {
        login: string;
      }
    >(
      gql`
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
      authGitHub,
      {
        login,
      }
    );

    if (organization) {
      this.OrganizationRepository.save(organization).catch(err => {
        console.error(err);
      });
      this.RepositoryOwnerRepository.save({
        ...organization,
        organization,
      }).catch(err => {
        console.error(err);
      });
    }

    return organization;
  }

  @FieldResolver()
  async members(
    @Ctx() { authGitHub }: IContext,
    @Root() { login, id }: GitHubOrganization
  ) {
    let after: string | undefined;
    let hasNextPage: boolean;

    let members: GitHubUser[] = [];

    do {
      const { organization } = await GitHubAPI.query<
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
      >(
        gql`
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
        authGitHub,
        {
          login,
          after,
        }
      );

      members.push(...organization.membersWithRole.nodes);
      after = organization.membersWithRole.pageInfo.endCursor;
      hasNextPage = organization.membersWithRole.pageInfo.hasNextPage;
    } while (hasNextPage);
    this.OrganizationRepository.save({ id, members }).catch(err => {
      console.error(err);
    });

    return members;
  }

  @FieldResolver()
  async repositories(
    @Ctx() { authGitHub }: IContext,
    @Root() { login, id }: GitHubOrganization,
    @Arg("isTemplate", { defaultValue: undefined, nullable: true })
    isTemplate: boolean
  ) {
    let after: string | undefined;
    let hasNextPage: boolean;

    let repositories: GitHubRepository[] = [];

    do {
      const {
        organization: {
          repositories: { nodes, pageInfo },
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
      >(
        gql`
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
        authGitHub,
        {
          login,
          after,
        }
      );

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

    this.OrganizationRepository.save({ id, repositories }).catch(err => {
      console.error(err);
    });

    return repositories;
  }
}
