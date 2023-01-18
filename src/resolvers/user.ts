import { ObjectId } from "mongo";
import { UsersCollection } from "../db/dbconnection.ts";
import { UserSchema } from "../db/schema.ts";
import { User } from "../types.ts";

const UserResolver = {
  id: (parent: UserSchema | User) =>
    (parent as User).id ? (parent as User).id : new ObjectId((parent as UserSchema)._id),
  comments: async (parent: UserSchema | User) => {
    try {
      const id = new ObjectId((parent as UserSchema)._id);
      const userFound = await UsersCollection.aggregate([
            { $match: { _id: id } },
            { $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "author",
                as: "comments",
            } },
            { $unwind: "$comments" },
            { $replaceRoot: { newRoot: "$comments" } },
        ]).toArray();
        if (!userFound) {
            throw new Error("User does not exist");
            }
        return userFound;
    } catch (e) {
        throw new Error(e);
        }
    },
   posts: async (parent: UserSchema | User) => {
    try {
      const id = new ObjectId((parent as UserSchema)._id);
      const userFound = await UsersCollection.aggregate([
            { $match: { _id: id } },
            { $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "author",
                as: "posts",
            } },
            { $unwind: "$posts" },
            { $replaceRoot: { newRoot: "$posts" } },
        ]).toArray();
        if (!userFound) {
            throw new Error("User does not exist");
            }
        return userFound;
    } catch (e) {
        throw new Error(e);
        }
    },

};


export default UserResolver;
