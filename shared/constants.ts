export const GRAPHQL_URL =
  typeof window !== "undefined"
    ? "/api/graphql"
    : "http://localhost:4000/api/graphql";
