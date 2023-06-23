
export type User = {
  id: string;
  username: string;
  email: string;
  password?: string;
  name: string;
  surname: string;
  token?: string;
  comments : Comment[]
  posts : Post[]
};

export type Post = {
  id : string;
  title : string;
  body : string;
  author : User
  comments : Comment[]
}

export type Comment = {
  id : string;
  author : User;
  body : string;
  post : Post;
}