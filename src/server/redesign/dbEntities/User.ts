import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn } from "typeorm";

import { Template } from "./Template";
import { UserGitHub } from "./UserGitHub";

@Entity()
@ObjectType()
export class User {
  @Field()
  @PrimaryColumn()
  id: string;

  @Field()
  @Column({ default: false })
  admin: boolean;

  @Column()
  accessToken: string;

  @Field(() => [Template])
  @OneToMany(() => Template, template => template.owner)
  templates: Template[];

  @Field(() => [Template])
  @ManyToMany(() => Template, template => template.upvotes, {})
  @JoinTable()
  upvotedTemplates: Template[];

  @Field(() => UserGitHub)
  @OneToOne(() => UserGitHub, {
    cascade: true,
    nullable: false,
  })
  data: UserGitHub;
}
