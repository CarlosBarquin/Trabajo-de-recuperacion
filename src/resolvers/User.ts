import { ObjectId } from "mongo";
import {CommentCollection, PostCollection, UsersCollection } from "../db/dbconnection.ts";
import { CommentSchema, PostSchema, UserSchema } from "../db/schema.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Comment, User } from "../types.ts";


const UserResolver = {
    id : (parent : UserSchema | User) =>{
        const p = parent as UserSchema
        return p._id.toString()
    },
    comments : async (parent : UserSchema | User) => {
        try {
            const p = parent as UserSchema
            const comments = await CommentCollection.find({author : p._id}).toArray()
            return comments
        } catch (error) {
            throw new Error(error)
        }
    },
    posts : async (parent : UserSchema | User) => {
        try {
            const p = parent as UserSchema
            const Post = await PostCollection.find({author : p._id}).toArray()
            return Post
        } catch (error) {
            throw new Error(error)
        }
    }
}

export default UserResolver