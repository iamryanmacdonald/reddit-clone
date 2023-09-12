import { Post, Subreddit } from "@prisma/client";
import { z } from "zod";

import {
  CompletePost,
  PostModel,
  PostVoteModel,
  RelatedPostModel,
} from "~/lib/validators";

export const APIModelInputs = {
  "posts:GET": z.object({
    after: z.coerce.number().optional(),
    subreddit: z.string().optional(),
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
  "posts/[id]/vote:POST": PostVoteModel.omit({ postId: true, userId: true }),
};

export interface APIModelOutputs {
  "posts:GET": {
    nextCursor: number | undefined;
    posts: CompletePost[];
  };
  "posts:POST": {
    postId: number;
    subreddit: string;
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
