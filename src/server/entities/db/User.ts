import { Field, ID, ObjectType } from "type-graphql";
import {
    Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryColumn
} from "typeorm";

import { APILevel } from "../../../consts";
import { Template } from "./Template";
import { UserGitHub } from "./UserGitHub";

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryColumn()
  id: string;

  @Field()
  @Column({ default: false })
  admin: boolean;

  @Column()
  accessToken: string;

  @Field(() => APILevel)
  @Column({ type: "enum", enum: APILevel, default: APILevel.BASIC })
  APILevel: APILevel;

  @Column({ nullable: true })
  personalAccessToken?: string;

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
    eager: true,
  })
  @JoinColumn({ name: "data" })
  data: UserGitHub;
}
