import gql from "graphql-tag";
import { Arg, Authorized, Ctx, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../../../utils";
import { APILevel } from "../../../consts";
import { IContext } from "../../../interfaces";
import { GitHubOrganization, Organization, OrganizationGitHub } from "../../entities";

@Resolver(() => OrganizationGitHub)
export class OrganizationGitHubResolver {
  constructor(
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>
  ) {}

  @Authorized(APILevel.ADVANCED)
  @Query(() => OrganizationGitHub)
  async organization(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("login") login: string
  ) {
    const {
      data: { organization },
    } = await GitHubAPI.query<
      {
        organization: GitHubOrganization;
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

    this.OrganizationRepository.save(organization);

    return organization;
  }
}
