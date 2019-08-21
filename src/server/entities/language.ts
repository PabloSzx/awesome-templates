import { Type } from "class-transformer";
import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { GitRepository } from "./repository";

@ObjectType()
@Entity()
export class Language {
  @Field(_type => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Type(() => GitRepository)
  @Field(_type => [GitRepository], { defaultValue: [] })
  @OneToMany(_type => GitRepository, repository => repository.id, {})
  repositories?: GitRepository[];
}
