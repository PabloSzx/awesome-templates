import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { GitRepository } from "./repository";

@ObjectType()
@Entity()
export class Language {
  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field(_type => [GitRepository], { defaultValue: [] })
  @OneToMany(_type => GitRepository, repository => repository.languages, {})
  repositories?: GitRepository[];
}
