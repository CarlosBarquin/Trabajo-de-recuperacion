import { ObjectId } from "mongo";
import { CommentsCollection, PostsCollection, UsersCollection } from "../db/dbconnection.ts";
import { CommentSchema, PostSchema, UserSchema } from "../db/schema.ts";
import { Post, User } from "../types.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { createJWT, verifyJWT } from "../lib/jwt.ts";
import { update } from "https://deno.land/x/mongo@v0.31.1/src/collection/commands/update.ts";

export const Mutation = {
  register: async (
    parent: unknown,
    args: {
      username: string;
      email: string;
      password: string;
      name: string;
      surname: string;
    }
  ): Promise<UserSchema & { token: string }> => {
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
          posts: [],
          comments: []
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
        posts: [],
        comments: [],
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
    parent: unknown,
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
    const validPassword = await bcrypt.compare(args.password, user.password?.toString()!);
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
          posts: [],
          comments: []
    },
      Deno.env.get("JWT_SECRET")!
    );
    return token;
    } catch (e) {
    throw new Error(e);
    }
  },

  createPost: async (
    parent: unknown,
    args: {
      title: string;
      body: string;
      token: string;
    }
  ): Promise<PostSchema | undefined> => {
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      console.log(user.name);
      const postFound: PostSchema | undefined = await PostsCollection.findOne({title: args.title});
      if(postFound){
        throw new Error("Post already exists");
      }
      if(user.username != undefined){
        const id = new ObjectId();
        const userfound: UserSchema | undefined = await UsersCollection.findOne({username: user.username});
        if(userfound){
        const newPost: PostSchema = {
          _id : id,
          title: args.title,
          body: args.body,
          author: userfound._id,
          comments: []
        };
        await PostsCollection.insertOne(newPost);
        return newPost;
      }
      }else{
        throw new Error("User does not exist");
      }


    } catch (e) {
      throw new Error(e);
    }
  },

  updatePost: async (
    parent: unknown,
    args: {
      id: string;
      title: string;
      body: string;
      token: string;
    }
  ) : Promise<PostSchema | undefined>=> {
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      const id = new ObjectId(args.id);
      const postFound: PostSchema | undefined = await PostsCollection.findOne({_id: id});
      if(!postFound){
        throw new Error("Post does not exist");
      }
      if(user.id == postFound.author.toString()){
        await PostsCollection.updateOne({_id: new ObjectId(args.id)}, {$set: {title: args.title, body: args.body}});
        const updatedPost: PostSchema | undefined = await PostsCollection.findOne({_id: id});
        return updatedPost;
      }else{
        throw new Error("You are not the author of this post");
      }

    } catch (e) {
      throw new Error(e);
    }
  },
  deletePost: async (
    parent: unknown,
    args: {
      id: string;
      token: string;
    }
  ) : Promise<PostSchema | undefined> => {
    
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      const postFound: PostSchema | undefined = await PostsCollection.findOne({_id: new ObjectId(args.id)});
      if(!postFound){
        throw new Error("Post does not exist");
      }
      if(user.id == postFound.author.toString()){
        await PostsCollection.deleteOne({_id: new ObjectId(args.id)});
        return postFound;
      }else{
        throw new Error("You are not the author of this post");
      }

    } catch (e) {
      throw new Error(e);
    }
  },
  createComment: async (
    parent: unknown,
    args: {
      body: string;
      postId: string;
      token: string;
    }
  ): Promise<CommentSchema | undefined> => {
    
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      const postFound: PostSchema | undefined = await PostsCollection.findOne({_id: new ObjectId(args.postId)});
      if(!postFound){
        throw new Error("Post does not exist");
      }
      if(user.username != undefined){
        const userFound: UserSchema | undefined = await UsersCollection.findOne({username: user.username});
        if(userFound){
        const newComent: CommentSchema = {
          _id: new ObjectId(),
          body: args.body,
          author: userFound._id,
          post: postFound._id
        };
        await CommentsCollection.insertOne(newComent);

        const arrcoment = postFound.comments;
        arrcoment.push(newComent._id);

        await PostsCollection.updateOne({_id: new ObjectId(args.postId)}, {$set: {comments: arrcoment}});
        
        return newComent;
      }
      }else{
        throw new Error("User does not exist");
      }

    } catch (e) {
      throw new Error(e);
    }
  },

  updateComment: async (
    parent: unknown,
    args: {
      id: string;
      body: string;
      token: string;
    }
  ) : Promise<CommentSchema | undefined>=> {
    try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      const id = new ObjectId(args.id);
      const commentFound: CommentSchema | undefined = await CommentsCollection.findOne({_id: id});
      if(!commentFound){
        throw new Error("Comment does not exist");
      }
      if(user.id == commentFound.author.toString()){
        await CommentsCollection.updateOne({_id: new ObjectId(args.id)}, {$set: {body: args.body}});
        const updatedComment: CommentSchema | undefined = await CommentsCollection.findOne({_id: id});
        return updatedComment;
      }else{
        throw new Error("You are not the author of this comment");
      }
    } catch (e) {
      throw new Error(e);
    }
  },
  deleteComment: async (
    parent: unknown,
    args: {
      id: string;
      token: string;
    }
  ) : Promise<CommentSchema | undefined> => {
 try {
      const user: User = (await verifyJWT(
        args.token,
        Deno.env.get("JWT_SECRET")!
      )) as User;
      const commentFound: CommentSchema | undefined = await CommentsCollection.findOne({_id: new ObjectId(args.id)});
      if(!commentFound){
        throw new Error("Comment does not exist");
      }
      if(user.id == commentFound.author.toString()){
        await CommentsCollection.deleteOne({_id: new ObjectId(args.id)});
        await PostsCollection.updateOne({_id: commentFound.post}, {$pull: {comments: new ObjectId(args.id)}});
        return commentFound;
      }else{
        const postFound: PostSchema | undefined = await PostsCollection.findOne({_id: commentFound.post});
        if(!postFound){
          throw new Error("Post does not exist");
        }
        if(user.id == postFound.author.toString()){

          await CommentsCollection.deleteOne({_id: new ObjectId(args.id)});
          await PostsCollection.updateOne({_id: commentFound.post}, {$pull: {comments: new ObjectId(args.id)}});
          return commentFound;
      }
    }
    throw new Error("You are not the author of this comment");
    } catch (e) {
      throw new Error(e);
    }
  },


  
  
};
