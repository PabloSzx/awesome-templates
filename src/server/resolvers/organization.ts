import { plainToClassFromExist } from "class-transformer";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { ADMIN, APILevel } from "../consts";
import { Organization, RepositoryGithubData, UserGitHubData } from "../entities";
import {
    IOrganizationDataQuery, IOrganizationDataQueryVariables, IOrganizationMembersQuery,
    IOrganizationMembersQueryVariables, IOrganizationReposQuery, IOrganizationReposQueryVariables,
    OrganizationDataQuery, OrganizationMembersQuery, OrganizationReposQuery
} from "../graphql/organization";
import { IContext } from "../interfaces";

@Resolver(_of => Organization)
export class OrganizationResolver {
  constructor(
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>
  ) {}

  @Authorized([ADMIN])
  @Query(_returns => [Organization])
  async organizations() {
    const organizationsList = await this.OrganizationRepository.find({
      relations: ["members", "repositories"],
    });

    return organizationsList;
  }

  @Authorized(APILevel.ADVANCED)
  @Query(_returns => Organization)
  async organization(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("login") login: string
  ) {
    const { data } = await GitHubAPI.query<
      IOrganizationDataQuery,
      IOrganizationDataQueryVariables
    >({
      query: OrganizationDataQuery,
      context,
      variables: {
        login,
      },
    });

    if (!data.organization) {
      throw new Error("Organization Not Found!");
    }

    let org = await this.OrganizationRepository.findOne(data.organization.id);
    if (!org) {
      org = this.OrganizationRepository.create(data.organization);
    } else {
      org = plainToClassFromExist(org, data.organization);
    }

    this.OrganizationRepository.save(org);

    return org;
  }

  @FieldResolver()
  async repositories(
    @Root() organization: Organization,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    if (organization.repositories === undefined) {
      let GitRepos: RepositoryGithubData[] = [];

      let cursor: string | undefined;

      let hasNextPage: boolean;
      do {
        const {
          data: {
            organization: {
              repositories: { nodes, pageInfo },
            },
          },
        } = await GitHubAPI.query<
          IOrganizationReposQuery,
          IOrganizationReposQueryVariables
        >({
          query: OrganizationReposQuery,
          context,
          variables: {
            after: cursor,
            login: organization.login,
          },
        });

        GitRepos.push(
          ..._.compact(
            _.map(nodes, repo => {
              if (
                repo &&
                (isTemplate !== undefined
                  ? repo.isTemplate === isTemplate
                  : true)
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

        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      } while (hasNextPage);

      this.OrganizationRepository.save({
        id: organization.id,
        repositories: GitRepos,
      });

      return GitRepos;
    } else {
      return _.orderBy(
        organization.repositories,
        ["starCount", "name"],
        ["desc", "asc"]
      );
    }
  }

  @FieldResolver()
  async members(
    @Root() organization: Organization,
    @Ctx() { authGitHub: context }: IContext
  ) {
    if (organization.members === undefined) {
      let members: UserGitHubData[] = [];

      let cursor: string | undefined;

      let hasNextPage: boolean;
      do {
        const {
          data: {
            organization: {
              members: { nodes, pageInfo },
            },
          },
        } = await GitHubAPI.query<
          IOrganizationMembersQuery,
          IOrganizationMembersQueryVariables
        >({
          query: OrganizationMembersQuery,
          context,
          variables: {
            after: cursor,
            login: organization.login,
          },
        });

        members.push(...nodes);

        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      } while (hasNextPage);

      this.OrganizationRepository.save({
        id: organization.id,
        members,
      });

      return members;
    } else {
      return organization.members;
    }
  }
}
