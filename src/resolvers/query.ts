
import { ObjectId } from "mongo";
import { calculateObjectSize } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";
import { verifyJWT } from "../libs/jwt.ts";
import { User } from "../types.ts";
import { PostCollection } from "../db/dbconnection.ts";

export const Query = {
  test:  () => {
    try {
      return "ole"
    } catch (e) {
      throw new Error(e);
    }
  },
  Me: async (_: unknown, args: { token: string }) :Promise<User> => {
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
  getPosts : async () =>{
    try {

      const posts = await PostCollection.find({}).toArray()

      return posts
      
    } catch (error) {
      throw new Error(error);
    }
  },
  getPost : async (_ : unknown, args : {id : string}) => {
    try {
        const found = await PostCollection.findOne({_id : new ObjectId(args.id)})
        if (found){
          return found
        }
        throw new Error("no existe")
    } catch (error) {
      throw new Error(error);
    }
  }
};