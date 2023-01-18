import { gql } from "graphql_tag";

export const typeDefs = gql`

type User {
    id: ID!
    username: String!
    email: String!
    password: String
    name: String!
    surname: String!
    token: String
    posts: [Post!]
    comments: [Comment!]
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    author: User!
    comments: [Comment!]
  }

  type Comment {
    id: ID!
    body: String!
    author: User!
    post: Post!
  }


  type Query {
    Me(token: String!): User!
    getPost(id: ID!): Post!
    getComment(id: ID!): Comment!
    test: String!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      name: String!
      surname: String!
    ): User!
    login(username: String!, password: String!): String!
    createPost(title: String!, body: String!, token: String!): Post!
    updatePost(id: ID!,title: String!, body: String!, token: String!): Post!
    deletePost(id: ID, token: String): Post!
    createComment(body: String!, token: String!, postId: ID!): Comment!
    updateComment(id: ID!, body: String!, token: String!): Comment!
    deleteComment(id: ID!, token: String!): Comment!
  }
`;
