export type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  name: string;
  surname: string;
  token?: string;
  posts: Post[]
  comments: Comment[]
};
export type Post = {
  id: string;
  title: string
  body: string
  author: User
  comments: Comment[]
}

export type Comment = {
  id: string;
  body: string
  author: User
  post: Post
}