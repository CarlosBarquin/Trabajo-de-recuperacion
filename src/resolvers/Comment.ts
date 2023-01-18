import { ObjectId } from "mongo";
import { PostsCollection, UsersCollection } from "../db/dbconnection.ts";
import { CommentSchema } from "../db/schema.ts";
import { Comment } from "../types.ts";

const CommentResolver = {
  id: (parent: Comment | CommentSchema) =>
    (parent as Comment).id ? (parent as Comment).id : new ObjectId((parent as CommentSchema)._id),
  author: async (parent: Comment | CommentSchema) => {
    try {
      const id = new ObjectId((parent as CommentSchema).author);
      const userFound = await UsersCollection.findOne({ _id: id });
        if (!userFound) {
            throw new Error("User does not exist");
            }
        return userFound;
    } catch (e) {
        throw new Error(e);
        }
    },
    post: async (parent: Comment | CommentSchema) => {
        try {
            const id = new ObjectId((parent as CommentSchema).post);
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
    
};


export default CommentResolver;
