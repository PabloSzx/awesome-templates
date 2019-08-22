import _ from "lodash";
import { Arg, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { GitRepository, Language, Organization, PublishedRepository, User } from "../entities";

@Resolver(_of => Language)
export class LanguageResolver {
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

  @Query(_returns => [Language])
  async languages() {
    return await this.LanguageRepository.find({
      order: {
        publishedRepositoriesCount: "DESC",
        name: "ASC",
      },
    });
  }

  @Query(_returns => Language, { nullable: true })
  async language(@Arg("name") name: string) {
    return await this.LanguageRepository.findOne(name);
  }

  @FieldResolver()
  async repositories(@Root() language: Language) {
    const { repositories } = await this.LanguageRepository.findOneOrFail(
      language.name,
      {
        relations: ["repositories"],
      }
    );

    return _.orderBy(repositories, ["starCount", "name"], ["desc", "asc"]);
  }

  @FieldResolver()
  async publishedRepositories(@Root() language: Language) {
    const {
      publishedRepositories,
    } = await this.LanguageRepository.findOneOrFail(language.name, {
      relations: ["publishedRepositories"],
      order: {},
    });

    return _.orderBy(
      publishedRepositories,
      ["repository.starCount", "repository.name"],
      ["desc", "asc"]
    );
  }

  @FieldResolver()
  async publishedRepositoriesCount(@Root() language: Language) {
    // TODO: Optimize using an intermediate connection, like github api itself
    const {
      publishedRepositories,
    } = await this.LanguageRepository.findOneOrFail(language.name, {
      relations: ["publishedRepositories"],
    });

    this.LanguageRepository.update(language.name, {
      publishedRepositoriesCount: _.size(publishedRepositories),
    });

    return _.size(publishedRepositories);
  }
}
