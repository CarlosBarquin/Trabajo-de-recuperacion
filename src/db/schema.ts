import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";
import { User, Post, Comment} from "../types.ts";



export type UserSchema = Omit<User, "id" | "token" | "posts" | "comments"> & {
  _id: ObjectId;
};

export type PostSchema = Omit<Post, "id" | "author" | "comments"> & {
  _id: ObjectId;
  author : ObjectId;
}

export type CommentSchema = Omit<Comment, "id" | "author" | "post"> & {
  _id: ObjectId;
  author : ObjectId;
  post : ObjectId
}