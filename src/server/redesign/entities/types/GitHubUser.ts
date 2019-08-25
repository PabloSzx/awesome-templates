import { GitHubRepositoryOwner } from "./GitHubRepositoryOwner";

export class GitHubUser implements GitHubRepositoryOwner {
  id: string;

  avatarUrl: string;

  login: string;

  url: string;

  email: string;

  name?: string;

  bio?: string;
}
