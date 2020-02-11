import _ from "lodash";
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";

import { isDocument } from "@typegoose/typegoose";

import { NOT_AUTHORIZED } from "../../consts";
import {
  CreateTemplateInput,
  EnvironmentModel,
  FrameworkModel,
  GitRepositoryModel,
  LanguageModel,
  LibraryModel,
  Template,
  TemplateModel,
  UpdateTemplateInput,
  UserModel,
} from "../../entities";
import { IContext } from "../../interfaces";

@Resolver(() => Template)
export class TemplateResolver {
  @Query(() => [Template])
  async templates() {
    return await TemplateModel.find();
  }

  @Query(() => Template, { nullable: true })
  async template(@Arg("name") name: string, @Arg("owner") ownerName: string) {
    const templates = await TemplateModel.find({
      name: {
        $regex: new RegExp(name),
        $options: "i",
      },
    }).populate("owner.data");

    ownerName = _.toLower(ownerName);

    return _.find(templates, ({ owner }) => {
      if (ownerName) {
        if (
          owner &&
          isDocument(owner) &&
          owner.data &&
          isDocument(owner.data) &&
          owner.data?.login
        ) {
          return owner.data.login.includes(ownerName);
        }

        console.error(owner);

        throw new Error("53 owner Population error");
      }

      return true;
    });
  }

  @Query(() => Template, { nullable: true })
  async templateById(@Arg("id") id: string) {
    return await TemplateModel.findById(id);
  }

  @Authorized()
  @Mutation(() => Template)
  async createTemplate(
    @Args()
    {
      name,
      repositoryGitHubId,
      primaryLanguage,
      languages,
      frameworks,
      libraries,
      environments,
    }: CreateTemplateInput,
    @Ctx() { user: owner }: IContext
  ) {
    const newTemplate = await TemplateModel.findOneAndUpdate(
      { name },
      {
        owner,
      },
      {
        upsert: true,
        new: true,
      }
    );

    await Promise.all([
      (async () => {
        newTemplate.repository =
          (await GitRepositoryModel.findOne({
            githubId: repositoryGitHubId,
          })) || undefined;
      })(),
      (async () => {
        if (primaryLanguage)
          newTemplate.primaryLanguage =
            (await LanguageModel.findById(primaryLanguage)) || undefined;
      })(),
      (async () => {
        newTemplate.languages = await LanguageModel.find({
          _id: {
            $in: languages,
          },
        });
      })(),
      (async () => {
        newTemplate.frameworks = await FrameworkModel.find({
          _id: {
            $in: frameworks,
          },
        });
      })(),
      (async () => {
        newTemplate.libraries = await LibraryModel.find({
          $id: {
            $in: libraries,
          },
        });
      })(),
      (async () => {
        newTemplate.environments = await EnvironmentModel.find({
          $id: {
            $in: environments,
          },
        });
      })(),
    ]);

    return await newTemplate.save();
  }

  @Authorized()
  @Mutation(() => Template)
  async updateTemplate(
    @Args()
    {
      _id: templateId,
      name,
      repositoryId,
      primaryLanguage,
      languages,
      frameworks,
      libraries,
      environments,
    }: UpdateTemplateInput,
    @Ctx() { user }: IContext
  ) {
    const partialTemplate: Partial<Template> = {
      name,
    };
    let [template] = await Promise.all([
      TemplateModel.findById(templateId)
        .populate("owner")
        .populate("repository.owner"),
      (async () => {
        if (repositoryId)
          partialTemplate.repository =
            (await GitRepositoryModel.findById(repositoryId)) || undefined;
      })(),
      (async () => {
        if (primaryLanguage) {
          partialTemplate.primaryLanguage =
            (await LanguageModel.findById(primaryLanguage)) || undefined;
        }
      })(),
      (async () => {
        partialTemplate.languages = await LanguageModel.find({
          _id: {
            $in: languages,
          },
        });
      })(),
      (async () => {
        partialTemplate.frameworks = await FrameworkModel.find({
          _id: {
            $in: frameworks,
          },
        });
      })(),
      (async () => {
        partialTemplate.libraries = await LibraryModel.find({
          _id: {
            $in: libraries,
          },
        });
      })(),
      (async () => {
        partialTemplate.environments = await EnvironmentModel.find({
          _id: {
            $in: environments,
          },
        });
      })(),
    ]);

    if (
      template &&
      (user.admin ||
        (template.owner &&
          isDocument(template.owner) &&
          template.owner.id === user.id) ||
        (template.repository &&
          isDocument(template.repository) &&
          template.repository.owner &&
          isDocument(template.repository.owner) &&
          template.repository.owner.id === user.id))
    ) {
      _.assign(template, _.omitBy(partialTemplate, _.isUndefined));

      return await template.save();
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async owner(@Root() { owner }: Template) {
    if (owner) {
      return UserModel.findById(owner);
    }

    return null;
  }

  @Authorized()
  @Mutation(() => String)
  async removeTemplate(@Arg("id") id: string, @Ctx() { user }: IContext) {
    const template = await TemplateModel.findById(id)
      .populate("owner")
      .populate("repository.owner");

    if (
      template &&
      (user.admin ||
        (template.owner &&
          isDocument(template.owner) &&
          template.owner.id === user.id) ||
        (template.repository &&
          isDocument(template.repository) &&
          template.repository.owner &&
          isDocument(template.repository.owner) &&
          template.repository.owner.id === user.id))
    ) {
      await TemplateModel.findByIdAndRemove(id);
      return id;
    }
    throw new Error(NOT_AUTHORIZED);
  }

  @FieldResolver()
  async upvotes(@Root() { _id }: Template) {
    return (
      (await TemplateModel.findById(_id).populate("upvotes"))?.upvotes ?? []
    );
  }

  @FieldResolver()
  async repository(@Root() { _id, repository, ...rest }: Template) {
    const a = await TemplateModel.findById(_id).populate("repository");

    console.log(275, { a, _id, repository, rest });

    return a?.repository;
  }

  @FieldResolver()
  async upvotesCount(@Root() { _id }: Template) {
    console.log(281, { _id });
    return (
      (await TemplateModel.findById(_id).populate("upvotes"))?.upvotes.length ??
      0
    );
  }

  @FieldResolver()
  async languages(@Root() { _id }: Template) {
    return (
      (await TemplateModel.findById(_id).populate("languages"))?.languages ?? []
    );
  }

  @FieldResolver()
  async libraries(@Root() { _id }: Template) {
    return (await TemplateModel.findById(_id))?.libraries ?? [];
  }

  @FieldResolver()
  async frameworks(@Root() { _id }: Template) {
    return (
      (await TemplateModel.findById(_id).populate("frameworks"))?.frameworks ??
      []
    );
  }

  @FieldResolver()
  async environments(@Root() { _id }: Template) {
    return (
      (await TemplateModel.findById(_id).populate("environments"))
        ?.environments ?? []
    );
  }
}
