import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitRepository, Language, Organization, PublishedRepository, User } from "../entities";

@Resolver(_of => PublishedRepository)
export class PublishRepositoryResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly OrganizationRepository: Repository<Organization>,
    @InjectRepository(GitRepository)
    private readonly GitRepoRepository: Repository<GitRepository>,
    @InjectRepository(PublishedRepository)
    private readonly PublishedRepoRepository: Repository<PublishedRepository>,
    @InjectRepository(Language)
    private readonly LanguageRepository: Repository<Language>
  ) {}

  @Authorized()
  @Query(_returns => [PublishedRepository])
  async publishedRepositories() {
    return await this.PublishedRepoRepository.find();
  }

  @Authorized()
  @Mutation(_returns => PublishedRepository, { nullable: true })
  async publishRepository(@Arg("id") id: string) {
    const repository = await this.GitRepoRepository.findOneOrFail(id);
    if (repository.languages) {
      const publishedRepo = this.PublishedRepoRepository.create({
        repository,
        languages: repository.languages,
      });

      return await this.PublishedRepoRepository.save(publishedRepo);
    }
  }
}
