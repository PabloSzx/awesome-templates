import { Arg, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { ADMIN } from "../../../consts";
import { Template, User } from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => User)
export class UserResolver {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
    @InjectRepository(Template)
    private readonly TemplateRepository: Repository<Template>
  ) {}

  @Authorized([ADMIN])
  @Query(() => [User])
  async users() {
    return await this.UserRepository.find();
  }

  @FieldResolver()
  async templates(@Root() { id }: User) {
    return (await this.UserRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["templates"],
      loadEagerRelations: false,
    })).templates;
  }

  @FieldResolver()
  async upvotedTemplates(@Root() { id }: User) {
    return (await this.UserRepository.findOneOrFail(id, {
      select: ["id"],
      relations: ["upvotedTemplates"],
      loadEagerRelations: false,
    })).upvotedTemplates;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async toggleUpvote(@Arg("id") templateId: string, @Ctx() { user }: IContext) {
    const userUpvotes = await this.UserRepository.findOneOrFail(user.id, {
      select: ["id"],
      relations: ["upvotedTemplates"],
      loadEagerRelations: false,
    });

    let added: boolean;

    if (userUpvotes.upvotedTemplates.find(({ id }) => templateId === id)) {
      userUpvotes.upvotedTemplates = userUpvotes.upvotedTemplates.filter(
        ({ id }) => templateId !== id
      );
      added = false;
    } else {
      const template = await this.TemplateRepository.findOneOrFail(templateId, {
        select: ["id"],
      });
      userUpvotes.upvotedTemplates.push(template);
      added = true;
    }

    await this.UserRepository.save(userUpvotes);
    return added;
  }
}
