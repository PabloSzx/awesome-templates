import _ from "lodash";
import requireEnv from "require-env-variable";
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import { APILevel } from "../../consts";
import { User, UserModel } from "../../entities";
import { IContext } from "../../interfaces";
import { getGitHubAPIv3 } from "../../utils";

const { GITHUB_APP_ID } = requireEnv("GITHUB_APP_ID");

@Resolver()
export class AuthResolver {
  @Query(() => User, { nullable: true })
  async current_user(@Ctx() { isAuthenticated, user }: IContext) {
    if (isAuthenticated()) {
      await user.populate("data").execPopulate();

      return user;
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { logout, isAuthenticated }: IContext) {
    if (isAuthenticated()) {
      logout();
      return true;
    }
    return false;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async modifyPersonalAccessToken(
    @Arg("token") token: string,
    @Ctx() { user }: IContext
  ) {
    try {
      const { headers } = await getGitHubAPIv3(`/user`, {
        headers: {
          Authorization: `token ${token}`,
        },
      });

      // minScopes = ["read:org", "read:user"];

      if (
        _.get<string>(headers, "x-oauth-scopes", "").match(
          /(?=.*read:org.*)(?=.*read:user.*)/
        )
      ) {
        await UserModel.findByIdAndUpdate(user._id, {
          personalAccessToken: token,
        });
        return true;
      }
    } catch (err) {}
    await UserModel.findByIdAndUpdate(user._id, {
      personalAccessToken: "",
    });
    return false;
  }

  @Authorized()
  @Query(() => APILevel)
  async checkAPILevel(@Ctx() { user }: IContext) {
    const [appInstalled, validPersonalToken] = await Promise.all([
      new Promise<boolean>(async resolve => {
        try {
          const { data } = await getGitHubAPIv3<{
            total_count: number;
            installations: { id: number; app_id: number }[];
          }>("/user/installations", {
            headers: {
              Authorization: `token ${user.accessToken}`,
            },
          });

          resolve(
            _.some(
              data?.installations,
              ({ app_id }) => _.toInteger(app_id) === _.toInteger(GITHUB_APP_ID)
            )
          );
        } catch (err) {
          // console.error(err);
          resolve(false);
        }
      }),
      new Promise<boolean>(async resolve => {
        try {
          if (user.personalAccessToken) {
            const { headers } = await getGitHubAPIv3(`/user`, {
              headers: {
                Authorization: `token ${user.personalAccessToken}`,
              },
            });

            // minScopes = ["read:org", "read:user"];

            if (
              _.get<string>(headers, "x-oauth-scopes", "").match(
                /(?=.*read:org.*)(?=.*read:user.*)/
              )
            ) {
              resolve(true);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          resolve(false);
        }
      }),
    ]);

    if (validPersonalToken) {
      user.APILevel = APILevel.ADVANCED;

      UserModel.findByIdAndUpdate(user._id, {
        APILevel: APILevel.ADVANCED,
      }).catch(err => {
        console.error(err);
      });
      return APILevel.ADVANCED;
    }

    if (appInstalled) {
      user.APILevel = APILevel.MEDIUM;
      UserModel.findByIdAndUpdate(user._id, {
        APILevel: APILevel.MEDIUM,
      }).catch(err => {
        console.error(err);
      });
      return APILevel.MEDIUM;
    }

    user.APILevel = APILevel.BASIC;
    UserModel.findByIdAndUpdate(user._id, { APILevel: APILevel.BASIC }).catch(
      err => {
        console.error(err);
      }
    );
    return APILevel.BASIC;
  }
}
