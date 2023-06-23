import { Server } from "std/http/server.ts";
import { GraphQLHTTP } from "gql";
import { makeExecutableSchema } from "graphql_tools";

import { typeDefs } from "./schema.ts";
import { Mutation } from "./resolvers/mutation.ts";
import { Query } from "./resolvers/query.ts";
import UserResolver from "./resolvers/User.ts";
import PostResolver from "./resolvers/Post.ts";
import CommentResolver from "./resolvers/Comment.ts";

const resolvers = {
  Mutation,
  Query,
  User : UserResolver,
  Post : PostResolver,
  Comment : CommentResolver

};

const s = new Server({
  handler: async (req) => {
    const { pathname } = new URL(req.url);

    return pathname === "/graphql"
      ? await GraphQLHTTP<Request>({
          schema: makeExecutableSchema({ resolvers, typeDefs }),
          graphiql: true,
        })(req)
      : new Response("Not Found", { status: 404 });
  },
  port: 3000,
});

s.listenAndServe();

console.log(`Server running on: http://localhost:3000/graphql`);