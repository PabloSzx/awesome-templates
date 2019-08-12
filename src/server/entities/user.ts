import { Field, ID, ObjectType } from "type-graphql";
import { Column, Entity, PrimaryColumn } from "typeorm";

@ObjectType()
@Entity()
export class User {
  @Field(_type => ID)
  @PrimaryColumn()
  id: number;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  displayName: string;

  @Field()
  @Column()
  profileUrl: string;

  @Field()
  @Column()
  avatar_url: string;

  @Field({ nullable: true })
  @Column({ default: false })
  admin: boolean;

  @Column()
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;
}
