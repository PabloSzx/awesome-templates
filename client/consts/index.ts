export const DOMAIN =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:8000"
    : "https://awesome-templates.dev";

export const ADMIN = "admin";
export const APP_INSTALLED = "app_installed";
export const WRONG_INFO = "WRONG_INFO";
export const USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS";
export const NOT_AUTHORIZED = "Not Authorized";
export const GRAPHQL_URL = `${DOMAIN}/api/graphql`;
export enum APILevel {
  BASIC = "BASIC",
  MEDIUM = "MEDIUM",
  ADVANCED = "ADVANCED",
}
