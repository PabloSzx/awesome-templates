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
  async language(
    @Arg("name") name: string,
    @Arg("exact", { defaultValue: false }) exact: boolean
  ) {
    if (exact) return await this.LanguageRepository.findOne(name);

    return await this.LanguageRepository.findOne({
      where: `"name" ILIKE '${name}'`,
    });
  }

  @FieldResolver()
  async repositories(@Root() language: Language) {
    return _.orderBy(
      (await this.LanguageRepository.findOneOrFail(language.name, {
        relations: ["repositories"],
      })).repositories,
      ["starCount", "name"],
      ["desc", "asc"]
    );
  }

  @FieldResolver()
  async publishedRepositories(@Root() language: Language) {
    return _.orderBy(
      (await this.LanguageRepository.findOneOrFail(language.name, {
        relations: ["publishedRepositories"],
        order: {},
      })).publishedRepositories,
      ["repository.starCount", "repository.name"],
      ["desc", "asc"]
    );
  }

  @FieldResolver()
  async publishedRepositoriesCount(@Root() language: Language) {
    // TODO: Optimize using an intermediate connection, like github api itself
    const publishedRepositoriesCount = _.size(
      (await this.LanguageRepository.findOneOrFail(language.name, {
        relations: ["publishedRepositories"],
      })).publishedRepositories
    );

    this.LanguageRepository.update(language.name, {
      publishedRepositoriesCount,
    });

    return publishedRepositoriesCount;
  }

  @FieldResolver()
  async libraries(@Root() language: Language) {
    return (await this.LanguageRepository.findOneOrFail(language.name, {
      relations: ["libraries"],
    })).libraries;
  }

  @FieldResolver()
  async frameworks(@Root() language: Language) {
    return (await this.LanguageRepository.findOneOrFail(language.name, {
      relations: ["frameworks"],
    })).frameworks;
  }
}
