import { Subreddit } from "@prisma/client";
import { z } from "zod";

import { CommentType } from "~/components/comment";
import {
  CommentModel,
  CommentVoteModel,
  CompletePost,
  PostModel,
  PostVoteModel,
} from "~/lib/validators";

export const APIModelInputs = {
  "comments/[id]/vote:POST": CommentVoteModel.omit({
    commentId: true,
    userId: true,
  }),
  "posts:GET": z.object({
    after: z.coerce.number().optional(),
    subreddit: z.string().nullish().optional(),
    take: z.coerce.number().optional(),
  }),
  "posts:POST": PostModel.omit({
    authorId: true,
    createdAt: true,
    id: true,
    subredditId: true,
    updatedAt: true,
  })
    .merge(
      z.object({
        subreddit: z.string().min(3, { message: "Must select a subreddit" }),
      }),
    )
    .refine(
      (data) => (data.content && !data.url) || (!data.content && data.url),
      "URL or content should be provided",
    ),
  "posts/[id]:PATCH": PostModel.omit({
    authorId: true,
    createdAt: true,
    id: true,
    subredditId: true,
    title: true,
    updatedAt: true,
    url: true,
  }),
  "posts/[id]/comments:POST": CommentModel.omit({
    authorId: true,
    createdAt: true,
    id: true,
    updatedAt: true,
  }),
  "posts/[id]/vote:POST": PostVoteModel.omit({ postId: true, userId: true }),
};

export interface APIModelOutputs {
  "comments/[id]/vote:POST": {
    vote: number;
    votes: number;
  };
  "posts:GET": {
    nextCursor: number | undefined;
    posts: CompletePost[];
  };
  "posts:POST": {
    postId: number;
    subreddit: string;
  };
  "posts/[id]:PATCH": {
    content: string | null;
  };
  "posts/[id]/comments:POST": {
    comment: CommentType;
  };
  "posts/[id]/vote:POST": {
    vote: number;
    votes: number;
  };
  "subreddits/search:POST": {
    subreddit: Subreddit;
    subscribed: boolean;
  }[];
}
