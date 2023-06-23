import { ObjectId } from "mongo";
import {CommentCollection, PostCollection, UsersCollection } from "../db/dbconnection.ts";
import { CommentSchema, PostSchema, UserSchema } from "../db/schema.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Comment, User } from "../types.ts";


const CommentResolver = {
    id : (parent : CommentSchema | Comment) =>{
        const p = parent as CommentSchema
        return p._id.toString()
    },
    post : async (parent : CommentSchema | Comment) => {
        try {
            const p = parent as CommentSchema
            const post = await PostCollection.findOne({_id : p.post})

            return post
        } catch (error) {
            throw new Error(error)
        }
    },
    author : async (parent : CommentSchema | Comment) =>{
        try {
            const p = parent as CommentSchema
            const user = await UsersCollection.findOne({_id : p.author})
            return user
        } catch (error) {
            throw new Error(error)
        }
    }
}

export default CommentResolver