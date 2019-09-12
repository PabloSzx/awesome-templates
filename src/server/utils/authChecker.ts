import { AuthChecker } from "type-graphql";

import { ADMIN, APILevel } from "../../consts";
import { IContext } from "../interfaces/server";

export const authChecker: AuthChecker<IContext> = async (
  { context: { isAuthenticated, user } },
  roles
) => {
  const authenticated = isAuthenticated();

  if (!authenticated) return false;

  for (const role of roles) {
    switch (role) {
      case APILevel.MEDIUM: {
        switch (user.APILevel) {
          case APILevel.MEDIUM:
          case APILevel.ADVANCED:
            continue;
          default:
            throw new Error(
              `You need to have API Level of ${APILevel.MEDIUM} or ${APILevel.ADVANCED}`
            );
        }
      }
      case APILevel.ADVANCED: {
        switch (user.APILevel) {
          case APILevel.ADVANCED:
            continue;
          default:
            throw new Error(
              `You need to have API Level of ${APILevel.ADVANCED}`
            );
        }
      }
      case ADMIN: {
        if (!user.admin) return false;
        continue;
      }
      default:
    }
  }
  return true;
};
