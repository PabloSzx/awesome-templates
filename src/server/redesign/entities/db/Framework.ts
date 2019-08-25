import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from "typeorm";

import { Language } from "./Language";
import { Template } from "./Template";

@Entity()
@ObjectType()
export class Framework {
  @Field()
  @PrimaryColumn()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description?: string;

  @Field(() => [Language])
  @ManyToMany(() => Language, lang => lang.frameworks, {
    cascade: true,
  })
  @JoinTable()
  languages: Language[];

  @Field(_type => [Template])
  @ManyToMany(_type => Template, template => template.frameworks)
  templates: Template[];
}
