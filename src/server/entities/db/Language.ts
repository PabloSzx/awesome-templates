import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";

import { LanguageGitHub } from "../githubAPI/LanguageGitHub";
import { Framework } from "./Framework";
import { GitRepository } from "./GitRepository";
import { Library } from "./Library";
import { Template } from "./Template";

@Entity()
@ObjectType()
export class Language implements LanguageGitHub {
  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field(() => [GitRepository])
  @ManyToMany(() => GitRepository, repo => repo.languages)
  repositories: GitRepository[];

  @Field(() => [GitRepository])
  @OneToMany(() => GitRepository, repo => repo.primaryLanguage)
  primaryRepositories: GitRepository[];

  @Field(() => [Template])
  @ManyToMany(() => Template, template => template.languages)
  templates: Template[];

  @Field(() => [Template])
  @OneToMany(() => Template, template => template.primaryLanguage)
  primaryTemplates: Template[];

  @Field(() => [Framework])
  @ManyToMany(() => Framework, framework => framework.languages)
  frameworks: Framework[];

  @Field(() => [Library])
  @OneToMany(() => Library, lib => lib.language)
  libraries: Library[];
}
