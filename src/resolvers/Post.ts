import { ObjectId } from "mongo";
import { PostsCollection, UsersCollection } from "../db/dbconnection.ts";
import { PostSchema } from "../db/schema.ts";
import { Post } from "../types.ts";

const PostResolver = {
  id: (parent: PostSchema | Post) =>
    (parent as Post).id ? (parent as Post).id : new ObjectId((parent as PostSchema)._id),
  author: async (parent: PostSchema | Post) => {
    try {
      const id = new ObjectId((parent as PostSchema).author);
      const userFound = await UsersCollection.findOne({ _id: id });
        if (!userFound) {
            throw new Error("User does not exist");
            }
        return userFound;
    } catch (e) {
        throw new Error(e);
        }
    },
  comments: async (parent: PostSchema | Post)  => {
    try {
      const id = new ObjectId((parent as PostSchema)._id);
      const postFound = await PostsCollection.aggregate([
            { $match: { _id: id } },
            { $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "post",
                as: "comments",
            } },
            { $unwind: "$comments" },
            { $replaceRoot: { newRoot: "$comments" } },
        ]).toArray();
        if (!postFound) {
            throw new Error("Post does not exist");
            }
        return postFound;
    } catch (e) {
        throw new Error(e);
        }
    },
    
    
};


export default PostResolver;
