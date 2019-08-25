import { GitHubLanguage } from "./GitHubLanguage";
import { GitHubRepositoryOwner } from "./GitHubRepositoryOwner";

export class GitHubRepository {
  id: string;

  createdAt: Date;

  updatedAt: Date;

  isLocked: boolean;

  isArchived: boolean;

  isDisabled: boolean;

  isFork: boolean;

  isTemplate: boolean;

  forkCount: number;

  name: string;

  nameWithOwner: string;

  description?: string;

  url: string;

  primaryLanguage?: GitHubLanguage;

  owner: GitHubRepositoryOwner;
}
