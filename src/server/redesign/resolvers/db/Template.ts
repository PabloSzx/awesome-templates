import { FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Template } from "../../entities";

@Resolver(() => Template)
export class TemplateResolver {
  constructor(
    @InjectRepository(Template)
    private readonly TemplateRepository: Repository<Template>
  ) {}

  @Query(() => [Template])
  async templates() {
    return await this.TemplateRepository.find();
  }

  @FieldResolver()
  async upvotes(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      relations: ["upvotes"],
    })).upvotes;
  }

  @FieldResolver()
  async upvotesCount(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      relations: ["upvotes"],
    })).upvotes.length;
  }

  @FieldResolver()
  async languages(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      relations: ["languages"],
    })).languages;
  }

  @FieldResolver()
  async libraries(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      relations: ["libraries"],
    })).libraries;
  }

  @FieldResolver()
  async frameworks(@Root() { id }: Template) {
    return (await this.TemplateRepository.findOneOrFail(id, {
      relations: ["frameworks"],
    })).frameworks;
  }
}
