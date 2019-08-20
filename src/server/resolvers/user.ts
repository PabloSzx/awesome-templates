import { plainToClassFromExist } from "class-transformer";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { ADMIN } from "../consts";
import { RepositoryGithubData, User } from "../entities";
import {
    IViewerDataQuery, IViewerReposQuery, IViewerReposQueryVariables, ViewerDataQuery,
    ViewerReposQuery
} from "../graphql/repository";
import { IContext } from "../interfaces";

@Resolver(_of => User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>
  ) {}

  @Authorized([ADMIN])
  @Query(_returns => [User])
  async users() {
    const usersList = await this.UserRepository.find();

    return usersList;
  }

  @Authorized()
  @Query(_returns => User)
  async viewerData(@Ctx() { authGitHub: context }: IContext) {
    const { data } = await GitHubAPI.query<IViewerDataQuery>({
      query: ViewerDataQuery,
      context,
    });

    console.log("data.viewer", data.viewer);
    let user = await this.UserRepository.findOne(data.viewer.id);
    if (!user) {
      throw new Error("User Not Found!");
    }

    user = plainToClassFromExist(user, data.viewer);

    this.UserRepository.save(user);

    return user;
  }

  @FieldResolver()
  async repositories(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    let GitRepos: RepositoryGithubData[] = [];

    let cursor: string | undefined;

    let hasNextPage: boolean;
    do {
      const {
        data: {
          viewer: {
            repositories: { nodes, pageInfo },
          },
        },
      } = await GitHubAPI.query<IViewerReposQuery, IViewerReposQueryVariables>({
        query: ViewerReposQuery,
        context,
        variables: {
          after: cursor,
        },
      });

      GitRepos.push(
        ..._.compact(
          _.map(nodes, repo => {
            if (
              repo &&
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

      hasNextPage = pageInfo.hasNextPage;
      cursor = pageInfo.endCursor;
    } while (hasNextPage);

    return GitRepos;
  }
}
