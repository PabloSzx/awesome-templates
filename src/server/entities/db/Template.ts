import { IsBase64, IsUUID, MinLength } from "class-validator";
import { ArgsType, Field, ID, InputType, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn
} from "typeorm";

import { Environment } from "./Environment";
import { Framework } from "./Framework";
import { GitRepository } from "./GitRepository";
import { Language } from "./Language";
import { Library } from "./Library";
import { User } from "./User";

@Entity()
@ObjectType()
export class Template {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  name: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.templates, {
    nullable: false,
    eager: true,
  })
  owner: User;

  @Field(() => User)
  @ManyToMany(() => User, user => user.upvotedTemplates)
  upvotes: User[];

  @Field()
  upvotesCount: number;

  @Field(() => GitRepository)
  @OneToOne(() => GitRepository, { nullable: false, eager: true })
  @JoinColumn({ name: "repository" })
  repository: GitRepository;

  @Field(() => [Language])
  @ManyToMany(() => Language, lang => lang.templates)
  @JoinTable()
  languages: Language[];

  @Field(() => Language, { nullable: true })
  @ManyToOne(() => Language, lang => lang.primaryTemplates, {
    eager: true,
  })
  @JoinTable()
  primaryLanguage?: Language;

  @Field(() => [Library])
  @ManyToMany(() => Library, lib => lib.templates)
  @JoinTable()
  libraries: Library[];

  @Field(() => [Environment])
  @ManyToMany(() => Environment, env => env.templates)
  @JoinTable()
  environments: Environment[];

  @Field(() => Framework)
  @ManyToMany(() => Framework, framework => framework.templates)
  @JoinTable()
  frameworks: Framework[];
}

@ArgsType()
export class CreateTemplateInput {
  @MinLength(3)
  @Field()
  name: string;

  @IsBase64()
  @Field()
  repositoryId: string;

  @MinLength(1)
  @Field({ nullable: true })
  primaryLanguage?: string;

  @MinLength(1, {
    each: true,
  })
  @Field(() => [String], { nullable: true })
  languages?: string[];

  @MinLength(2, {
    each: true,
  })
  @Field(() => [String], { nullable: true })
  frameworks?: string[];

  @MinLength(2, {
    each: true,
  })
  @Field(() => [String], { nullable: true })
  libraries?: string[];
}

@InputType({ description: "Edit template data" })
export class UpdateTemplateInput implements Partial<CreateTemplateInput> {
  @IsUUID()
  @Field()
  templateId: string;

  @MinLength(3)
  @Field({ nullable: true })
  name?: string;

  @IsBase64()
  @Field({ nullable: true })
  repositoryId?: string;

  @MinLength(1)
  @Field({ nullable: true })
  primaryLanguage?: string;

  @MinLength(1, {
    each: true,
  })
  @Field(() => [String], { nullable: true })
  languages?: string[];

  @MinLength(2, {
    each: true,
  })
  @Field(() => [String], { nullable: true })
  frameworks?: string[];

  @MinLength(2, {
    each: true,
  })
  @Field(() => [String], { nullable: true })
  libraries?: string[];
}
