import { Field, ObjectType } from "type-graphql";
import {
    Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn
} from "typeorm";

import { Framework } from "./Framework";
import { GitRepository } from "./GitRepository";
import { Language } from "./Language";
import { Library } from "./Library";
import { User } from "./User";

@Entity()
@ObjectType()
export class Template {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.templates, {
    cascade: true,
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
  @ManyToMany(() => Language, lang => lang.templates, { cascade: true })
  @JoinTable()
  languages: Language[];

  @Field(() => Language, { nullable: true })
  @ManyToOne(() => Language, lang => lang.primaryTemplates, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  primaryLanguage?: Language;

  @Field(() => [Library])
  @ManyToMany(() => Library, lib => lib.templates, { cascade: true })
  @JoinTable()
  libraries: Library[];

  @Field(() => Framework)
  @ManyToMany(() => Framework, framework => framework.templates, {
    cascade: true,
  })
  @JoinTable()
  frameworks: Framework[];
}
