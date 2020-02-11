import { ObjectId } from "mongodb";
import { Field, InputType, ObjectType } from "type-graphql";

import { getModelForClass, prop as Property, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";

import { ObjectIdScalar } from "../../utils/ObjectIdScalar";
import { User } from "./User";

@ObjectType()
export class Image extends TimeStamps {
  @Field(() => ObjectIdScalar)
  readonly _id: ObjectId;

  @Field()
  @Property({ required: true, unique: true, index: true })
  filename: string;

  @Field()
  @Property({ required: true })
  mimetype: string;

  @Field()
  @Property({ required: true })
  extension: string;

  @Field()
  @Property({ default: false, index: true })
  validated: boolean;

  @Field(() => User, { nullable: true })
  @Property({ ref: "User", index: true })
  uploader?: Ref<User>;

  @Property({ default: true, index: true })
  active: boolean;

  @Field({ nullable: true })
  @Property()
  size?: number;

  @Field({ nullable: true })
  @Property()
  width?: number;

  @Field({ nullable: true })
  @Property()
  height?: number;

  @Field(() => Date)
  @Property()
  uploadedAt: Date;

  @Field(() => Date)
  readonly updatedAt: Readonly<Date>;

  @Field(() => Date)
  readonly createdAt: Readonly<Date>;
}

export const ImageModel = getModelForClass(Image);

@InputType()
export class EditImage implements Partial<Image> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;

  @Field()
  validated: boolean;
}

@InputType()
export class RemoveImage implements Partial<Image> {
  @Field(() => ObjectIdScalar)
  _id: ObjectId;
}
