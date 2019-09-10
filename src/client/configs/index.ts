export const GRAPHQL_URL =
  process.env.NODE_ENV === "production"
    ? "https://awesome-templates.pszx.tech/api/graphql"
    : "http://localhost:3000/api/graphql";
