import gql from "graphql-tag";
import { Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { GitRepository, Language, Organization, User } from "../entities";
import { IContext } from "../interfaces";

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
    const { data } = await GitHubAPI.query({
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
                name
                nameWithOwner
                resourcePath
                primaryLanguage {
                  color
                  id
                  name
                }
                description
                url
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
                name
                nameWithOwner
                resourcePath
                primaryLanguage {
                  color
                  id
                  name
                }
                description
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
                    name
                    nameWithOwner
                    resourcePath
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
