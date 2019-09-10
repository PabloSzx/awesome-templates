import { GitHubRepositoryOwner } from "./GitHubRepositoryOwner";

export class GitHubOrganization implements GitHubRepositoryOwner {
  id: string;

  avatarUrl: string;

  login: string;

  url: string;

  email?: string;

  name?: string;

  description?: string;

  websiteUrl?: string;
}
