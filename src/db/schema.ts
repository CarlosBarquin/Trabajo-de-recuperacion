import { ObjectId } from "mongo";
import { Comment, Post, User } from "../types.ts";

export type UserSchema = Omit<User, "id" | "token" | "posts" | "comments"> & {
  _id: ObjectId;
  posts: ObjectId[];
  comments: ObjectId[];
};

export type PostSchema = Omit<Post, "id" | "author" | "comments"> & {
  _id: ObjectId;
  author: ObjectId;
  comments: ObjectId[];
};

export type CommentSchema = Omit<Comment, "id" | "author" | "post"> & {
  _id: ObjectId;
  author: ObjectId;
  post: ObjectId;
};