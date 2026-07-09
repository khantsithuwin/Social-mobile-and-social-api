export type UserType = {
  id: string;
  name: string;
  username: string;
  bio?: string;
};

export type PostType = {
  id: string;
  content: string;
  user: UserType;
  comments: CommentType[];
  likesCount: number;
  likedByMe: boolean;
  created: string;
};

export type CommentType = {
  id: string;
  content: string;
  user: UserType;
  post: PostType;
  created: string;
};
