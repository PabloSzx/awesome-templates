export const ADMIN = "admin";
export const APP_INSTALLED = "app_installed";
export const WRONG_INFO = "WRONG_INFO";
export const USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
export const DOMAIN =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/"
    : "https://awesome-templates.dev/";
export enum APILevel {
  BASIC = "BASIC",
  MEDIUM = "MEDIUM",
  ADVANCED = "ADVANCED",
}

export const GRAPHQL_URL = `${DOMAIN}api/graphql`;
