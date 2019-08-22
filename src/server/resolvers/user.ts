import { plainToClassFromExist } from "class-transformer";
import _ from "lodash";
import { Arg, Authorized, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitHubAPI } from "../../utils";
import { ADMIN, APILevel } from "../consts";
import { RepositoryGithubData, User } from "../entities";
import {
    IUserDataQuery, IUserDataQueryVariables, IUserReposQuery, IUserReposQueryVariables,
    IUserStarredReposQuery, IUserStarredReposQueryVariables, IViewerDataQuery, UserDataQuery,
    UserReposQuery, UserStarredReposQuery, ViewerDataQuery
} from "../graphql/user";
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

  @Authorized(APILevel.MEDIUM)
  @Query(_returns => User)
  async viewer(@Ctx() { authGitHub: context }: IContext) {
    const { data } = await GitHubAPI.query<IViewerDataQuery>({
      query: ViewerDataQuery,
      context,
    });

    let user = await this.UserRepository.findOneOrFail(data.viewer.id);

    user = plainToClassFromExist(user, data.viewer);

    this.UserRepository.save({ ...user, userGitHubData: data.viewer });

    return user;
  }

  @Authorized(APILevel.ADVANCED)
  @Query(_returns => User)
  async user(
    @Ctx() { authGitHub: context }: IContext,
    @Arg("login") login: string
  ) {
    const { data } = await GitHubAPI.query<
      IUserDataQuery,
      IUserDataQueryVariables
    >({
      query: UserDataQuery,
      context,
      variables: {
        login,
      },
    });

    if (!data.user) {
      throw new Error("User Not Found!");
    }

    let user = await this.UserRepository.findOne(data.user.id);
    if (!user) {
      user = this.UserRepository.create(data.user);
    } else {
      user = plainToClassFromExist(user, data.user);
    }

    this.UserRepository.save({ ...user, userGitHubData: data.user });

    return user;
  }

  @FieldResolver()
  async repositories(
    @Root() user: User,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    if (user.repositories === undefined) {
      let GitRepos: RepositoryGithubData[] = [];

      let cursor: string | undefined;

      let hasNextPage: boolean;
      do {
        const {
          data: {
            user: {
              repositories: { nodes, pageInfo },
            },
          },
        } = await GitHubAPI.query<IUserReposQuery, IUserReposQueryVariables>({
          query: UserReposQuery,
          context,
          variables: {
            after: cursor,
            login: user.login,
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

      this.UserRepository.save({
        id: user.id,
        repositories: GitRepos,
      });

      return GitRepos;
    } else {
      return _.orderBy(
        user.repositories,
        ["starCount", "name"],
        ["desc", "asc"]
      );
    }
  }

  @FieldResolver()
  async starredRepositories(
    @Root() user: User,
    @Ctx() { authGitHub: context }: IContext,
    @Arg("isTemplate", { nullable: true }) isTemplate?: boolean
  ) {
    if (user.starredRepositories === undefined) {
      let GitRepos: RepositoryGithubData[] = [];

      let cursor: string | undefined;

      let hasNextPage: boolean;
      do {
        const {
          data: {
            user: {
              starredRepositories: { nodes, pageInfo },
            },
          },
        } = await GitHubAPI.query<
          IUserStarredReposQuery,
          IUserStarredReposQueryVariables
        >({
          query: UserStarredReposQuery,
          context,
          variables: {
            after: cursor,
            login: user.login,
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

      this.UserRepository.save({
        id: user.id,
        starredRepositories: GitRepos,
      });

      return GitRepos;
    } else {
      return user.starredRepositories;
    }
  }
}
