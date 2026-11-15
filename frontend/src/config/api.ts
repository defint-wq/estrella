export const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URI ??
  (import.meta.env.DEV
    ? "http://localhost:4000/graphql"
    : "/graphql");

export const API_URL = new URL(
  GRAPHQL_URL,
  window.location.origin,
).origin;
