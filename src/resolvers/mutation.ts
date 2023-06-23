
import { ObjectId } from "mongo";
import {CommentCollection, PostCollection, UsersCollection } from "../db/dbconnection.ts";
import { CommentSchema, PostSchema, UserSchema } from "../db/schema.ts";
import { createJWT, verifyJWT } from "../libs/jwt.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Comment, User } from "../types.ts";
import { update } from "https://deno.land/x/mongo@v0.31.1/src/collection/commands/update.ts";
import { copy } from "https://deno.land/std@0.154.0/bytes/mod.ts";


export const Mutation = {
  register: async (
    _: unknown,
    args: {
      username: string;
      email: string;
      password: string;
      name: string;
      surname: string;
      admin : boolean
    }
  ): Promise<UserSchema & { token : String}> => {
    try {
      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });
      if (user) {
        throw new Error("User already exists");
      }
      const hashedPassword = await bcrypt.hash(args.password);
      const _id = new ObjectId();
      const token = await createJWT(
        {
          username: args.username,
          email: args.email,
          name: args.name,
          surname: args.surname,
          id: _id.toString(),
          posts : [],
          comments : [],
        },
        Deno.env.get("JWT_SECRET")!
      );
      const newUser: UserSchema = {
        _id,
        username: args.username,
        email: args.email,
        password: hashedPassword,
        name: args.name,
        surname: args.surname,
      };
      await UsersCollection.insertOne(newUser);
      return {
        ...newUser,
        token,
      };
    } catch (e) {
      throw new Error(e);
    }
  },
  login: async (
    _: unknown,
    args: {
      username: string;
      password: string;
    }
  ): Promise<string> => {
    try {
      const user: UserSchema | undefined = await UsersCollection.findOne({
        username: args.username,
      });
      if (!user) {
        throw new Error("User does not exist");
      }
      const pass = user.password as string
      const validPassword = await bcrypt.compare(args.password, pass);
      if (!validPassword) {
        throw new Error("Invalid password");
      }
      const token = await createJWT(
        {
          username: user.username,
          email: user.email,
          name: user.name,
          surname: user.surname,
          id: user._id.toString(),
          posts : [],
          comments : [],
        },
        Deno.env.get("JWT_SECRET")!
      );
      return token;
    } catch (e) {
      throw new Error(e);
    }
  },
  deleteUser : async (_: unknown, 
    args: {password: string, token : string}) : Promise<UserSchema | undefined> =>{
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;

      if(user.id === undefined){
        throw new Error("token invalido")
      }

      const USER: UserSchema | undefined = await UsersCollection.findOne({
        username: user.username,
      });

      const pass = USER?.password as string
      const validPassword = await bcrypt.compare(args.password, pass);

      if (!validPassword) {
        throw new Error("contraseña incorrecta");
      }

      await UsersCollection.deleteOne({_id : new ObjectId(user.id)})

      return USER

    } catch (error) {
      throw new Error(error)
    }
  },
  createPost : async (_: unknown , args: {title : string , body : string , token : string }) : Promise<PostSchema> =>{
    try {

      if(args.title === "" || args.body === "" || args.token === ""){
        throw new Error("FALTAN DATOS")
      }


        const found = await PostCollection.findOne({title : args.title}) 
        if (found){
          throw new Error("ya existe ese post")
        }

        const user: User = (await verifyJWT(
          args.token,
          Deno.env.get("JWT_SECRET")!
        )) as User;
        
        if(user.id === undefined){
          throw new Error("no existe usuario")
        }

        const Post : PostSchema = {
          _id : new ObjectId(),
          title : args.title,
          body : args.body,
          author : new ObjectId(user.id)
        }

        await PostCollection.insertOne(Post)

        return Post

    } catch (error) {
      throw new Error(error)
    }
  },
  updatePost: async (_: unknown, args :  { id : string ,title : string , body : string , token : string }): Promise<PostSchema> =>{
    try {


      // undefined y "" para que en apollo puedas o poner title:"" o no poner nada y funcione igual 
      if(args.title === undefined && args.body === undefined){
        throw new Error("FALTAN DATOS")
      }
      if(args.title === "" && args.body === ""){
        throw new Error("FALTAN DATOS")
      }

        const found = await PostCollection.findOne({_id : new ObjectId(args.id)}) 
        if (!found){
          throw new Error("no existe el post")
        }

        if(args.title === undefined) args.title = found.title
        if(args.body === undefined) args.body = found.body
        if(args.title === "") args.title = found.title
        if(args.body === "") args.body = found.body

        const user: User = (await verifyJWT(
          args.token,
          Deno.env.get("JWT_SECRET")!
        )) as User;
        
        if(user.id === undefined){
          throw new Error("no existe usuario")
        }

        if(found.author.toString() !== user.id){
          throw new Error("No eres el autor del post")
        }

         await PostCollection.updateOne({_id : new ObjectId(args.id)}, {$set : {
          title: args.title,
          body: args.body,
        }})


        return {
          _id : found._id,
          title : args.title,
          body : args.body,
          author : found.author
        }



      
    } catch (error) {
      throw new Error(error)
    }
  },
  deletePost : async (_: unknown, args : {id : string, token : string}) : Promise<PostSchema> =>{
      try {        
    const found = await PostCollection.findOne({_id : new ObjectId(args.id)}) 
    if (!found){
      throw new Error("no existe el post")
    }

    const user: User = (await verifyJWT(
      args.token,
      Deno.env.get("JWT_SECRET")!
    )) as User;
    
    if(user.id === undefined){
      throw new Error("no existe usuario")
    }

    if(found.author.toString() !== user.id){
      throw new Error("No eres el autor del post")
    }

    await PostCollection.deleteOne(found)

    return found

      } catch (error) {
         throw new Error(error)
      }
  },

  createComment : async (_: unknown , args : {id : string , body : string , token : string }) =>{
    try {

      if(args.body === ""){
        throw new Error("FALTAN DATOS")
      }

      const PostFound = await PostCollection.findOne({_id : new ObjectId(args.id)})
      if(!PostFound){
        throw new Error("no existe el post")
      }

      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      
      if(user.id === undefined){
        throw new Error("no existe usuario")
      }

      const comment : CommentSchema = {
        _id : new ObjectId(),
        body : args.body,
        author : new ObjectId(user.id),
        post : PostFound._id
      }

     await CommentCollection.insertOne(comment)

     return comment

    } catch (error) {
      throw new Error(error)
    }
  },
  
  updateComment : async (_:unknown, args : {id : string , body : string , token : string }) : Promise<CommentSchema> => {
    try {

      if(args.body === ""){
        throw new Error("FALTAN DATOS")
      }

      const found = await CommentCollection.findOne({_id : new ObjectId(args.id)})

      if(!found){
        throw new Error("no existe el comentario")
      }

      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      
      if(user.id === undefined){
        throw new Error("no existe usuario")
      }

      if(found.author.toString() !== user.id){
        throw new Error("No eres el autor del comentario")
      }

      await CommentCollection.updateOne({_id : new ObjectId(args.id)}, {$set : {
        body: args.body,
      }})


      return {
        _id : found._id,
        body : args.body,
        author : found.author,
        post : found.post
      }
      

      
    } catch (error) {
      throw new Error(error)
    }
  },
  
  deleteComment : async (_: unknown, args : {id : string, token : string}): Promise<CommentSchema> => {
    try {
      const found = await CommentCollection.findOne({_id: new ObjectId(args.id)})
      if(!found){
        throw new Error("no existe el post")
      }

      const post = await PostCollection.findOne({_id : found.post})

      
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      
      if(user.id === undefined){
        throw new Error("no existe usuario")
      }

      if(found.author.toString() === user.id || user.id === post!.author.toString()){

        await CommentCollection.deleteOne({_id : new ObjectId(args.id)})

        

        return found

      }

      throw new Error("No eres el autor del comentario o el creador del post")

    } catch (error) {
      throw new Error(error)
    }
  },
  deleteAllComments : async (_ : unknown , args : {id : string , token : string}) => {

    try {
        const Comments = await CommentCollection.find({post : new ObjectId(args.id)}).toArray()

        const Post = await PostCollection.findOne({_id : new ObjectId(args.id)})
        if(!Comments){
          throw new Error("no existe el post")
        }

        const user: User = (await verifyJWT(
          args.token,
          Deno.env.get("JWT_SECRET")!
        )) as User;
        
        if(user.id === undefined){
          throw new Error("no existe usuario")
        }

        if(user.id !== Post?.author.toString()){
          throw new Error("no eres el autor de este post")
        }

        await CommentCollection.delete({post : new ObjectId(args.id)})

        return Comments

    } catch (error) {
      throw new Error(error)
    }
  },
  updateAllComments : async (_ : unknown , args : {token : string, body: string} ) => {
    try {

      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      
      if(user.id === undefined){
        throw new Error("no existe usuario")
      }

      console.log(user.id)

        const comments = await CommentCollection.find({author : new ObjectId(user.id)}).toArray()
        if(comments.length === 0){
          throw new Error("no hay comentarios")
        }


        await CommentCollection.updateMany({author : new ObjectId(user.id)}, {$set : {
          body: args.body,
        }})

        const comments2 : CommentSchema[] = comments.map((comment)=>({
          _id : comment._id,
          body : args.body,
          post : comment.post,
          author : comment.author
        }))

        return comments2


    } catch (error) {
      throw new Error(error)
    }
  }
  

  
}
