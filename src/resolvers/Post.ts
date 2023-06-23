import { ObjectId } from "mongo";
import {CommentCollection, PostCollection, UsersCollection } from "../db/dbconnection.ts";
import { CommentSchema, PostSchema, UserSchema } from "../db/schema.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Comment, Post, User } from "../types.ts";


const PostResolver = {
    id : (parent : PostSchema | Post) =>{
        const p = parent as PostSchema
        return p._id.toString()
    },
    author : async (parent : PostSchema | Post) => {
        try {
            const p = parent as PostSchema
            const user = await UsersCollection.findOne({_id: p.author})

            return user
            
        } catch (error) {
            throw new Error(error)
        }
    },
    comments : async (parent : PostSchema | Post) => {
        try {
            const p = parent as PostSchema
            const comments = await CommentCollection.find({post : p._id}).toArray()

            return comments
            
        } catch (error) {
            throw new Error(error)
        }
    }
}

export default PostResolver