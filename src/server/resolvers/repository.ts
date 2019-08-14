import gql from "graphql-tag";
import { Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitRepository, Language, Organization, User } from "../entities";
import { IContext } from "../interfaces";
import githubAPI from "../utils/githubAPI";

@Resolver()
export class RepositoryResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>,
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Authorized()
  @Mutation(_returns => String)
  async userData(@Ctx() { authGitHub: context }: IContext) {
    const { data } = await githubAPI.query({
      // TODO: PAGINATE ALL
      query: gql`
        query {
          viewer {
            id
            avatarUrl
            login
            url
            email
            name
            bio
            repositories(last: 100, privacy: PUBLIC) {
              totalCount
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
                issues(first: 20) {
                  totalCount
                }
                name
                nameWithOwner
                primaryLanguage {
                  color
                  id
                  name
                }
                description
                languages(first: 20) {
                  totalCount
                  nodes {
                    color
                    id
                    name
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
            starredRepositories(last: 100) {
              totalCount
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
                issues(first: 20) {
                  totalCount
                }
                name
                nameWithOwner
                primaryLanguage {
                  color
                  id
                  name
                }
                description
                languages(first: 20) {
                  totalCount
                  nodes {
                    color
                    id
                    name
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
            organizations(first: 20) {
              totalCount
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                avatarUrl
                login
                url
                email
                name
                description
                websiteUrl
                repositories(last: 100, privacy: PUBLIC) {
                  totalCount
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
                    issues(first: 20) {
                      totalCount
                    }
                    name
                    nameWithOwner
                    primaryLanguage {
                      color
                      id
                      name
                    }
                    description
                    languages(first: 20) {
                      totalCount
                      nodes {
                        color
                        id
                        name
                      }
                      pageInfo {
                        hasNextPage
                        endCursor
                      }
                    }
                  }
                }
                membersWithRole(first: 30) {
                  totalCount
                  pageInfo {
                    hasNextPage
                    endCursor
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
          }
        }
      `,
      context,
    });

    return JSON.stringify(data);
  }
}
