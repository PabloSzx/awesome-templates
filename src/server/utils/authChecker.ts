import { AuthChecker } from "type-graphql";

import { getGitHubAPIv3 } from "../../utils";
import { ADMIN, APP_INSTALLED } from "../consts";
import { IContext } from "../interfaces/server";

export const authChecker: AuthChecker<IContext> = async (
  { context: { isAuthenticated, user, authGitHub } },
  roles
) => {
  const authenticated = isAuthenticated();
  if (!authenticated) return false;

  for (const role of roles) {
    switch (role) {
      case APP_INSTALLED: {
        return await (async () => {
          try {
            const { status, data } = await getGitHubAPIv3(
              "/user/installations",
              {
                headers: {
                  ...authGitHub.headers,
                  Accept: `application/vnd.github.machine-man-preview+json`,
                },
                validateStatus: status => {
                  switch (status) {
                    case 200:
                    case 403:
                      return true;
                    default:
                      return false;
                  }
                },
              }
            );

            switch (status) {
              case 200:
                return true;
              case 403:
              default:
                return false;
            }
          } catch (err) {
            console.error(err);
            throw err;
          }
        })();
      }
      case ADMIN: {
        if (!user.admin) return false;
        break;
      }
      default:
    }
  }
  return true;
};
