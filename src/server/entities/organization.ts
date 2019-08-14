import { Field, ObjectType } from "type-graphql";
import { Column, Entity, JoinTable, ManyToMany } from "typeorm";

import { RepositoryOwner } from "./repositoryOwner";
import { User } from "./user";

@ObjectType()
@Entity()
export class Organization extends RepositoryOwner {
  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  websiteUrl: string;

  @Field(_type => [User])
  @ManyToMany(_type => User, member => member.id, { cascade: true })
  @JoinTable()
  members: User[];
}
