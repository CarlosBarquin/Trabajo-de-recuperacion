import { ObjectId } from "mongo";
import { CommentsCollection, PostsCollection } from "../db/dbconnection.ts";
import { CommentSchema, PostSchema } from "../db/schema.ts";
import { verifyJWT } from "../lib/jwt.ts";
import { User } from "../types.ts";

export const Query = {

  test: () => {
    return "Hello World!";
  },
  Me: async (parent: unknown, args: { token: string }) => {
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      return user;
    } catch (e) {
      throw new Error(e);
    }
  },
  getPost: async (parent: unknown, args: { id: string }) : Promise<PostSchema> => {
    try {
      const id = new ObjectId(args.id);
      const postFound = await PostsCollection.findOne({
        _id: id,
      });
      if (!postFound) {
        throw new Error("Post does not exist");
      }
      return postFound;
    } catch (e) {
      throw new Error(e);
    }
  },
  getComment : async (parent: unknown, args: { id: string }) : Promise<CommentSchema> => {
    try {
      const id = new ObjectId(args.id);
      const commentFound = await CommentsCollection.findOne
      ({
        _id: id,
      });
      if (!commentFound) {
        throw new Error("Comment does not exist");
      }
      return commentFound;
    } catch (e) {
      throw new Error(e);
    }
  },
 

};
