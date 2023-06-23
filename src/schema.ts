import { gql } from "graphql_tag";

export const typeDefs = gql`

  type Comment {
    id : ID!
    author : User!
    body : String!
    post : Post!
  }

  type Post {
    id : ID!
    title : String!
    body : String!
    author : User!
    comments : [Comment!]!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    surname: String!
    token: String
    posts : [Post!]!
    comments : [Comment!]!
  }

  type Query {
    test : String!
    Me(token: String!): User!
    getPosts : [Post!]!
    getPost(id : ID!) : Post!
   
  }

  type Mutation {

    register(
      username: String!
      email: String!
      password: String!
      name: String!
      surname: String!,
    ): User!
    login(username: String!, password: String!): String!
    deleteUser(password: String!, token: String!) : User!

    createPost(title: String!, body: String!, token: String!) : Post!
    updatePost(id: ID!, title: String, body : String, token: String! ): Post!
    deletePost(id: ID!, token: String!) : Post!

    createComment(id: ID!, body: String!, token: String!) : Comment!
    updateComment(id: ID!, body: String!, token : String!) : Comment!
    deleteComment(id: ID!, token: String!) : Comment!
    deleteAllComments(id: ID!, token : String!) : [Comment!]!
    updateAllComments(token: String!, body : String!) : [Comment!]!

  }
`;
