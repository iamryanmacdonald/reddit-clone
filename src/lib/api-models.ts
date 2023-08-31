import { Subreddit } from "@prisma/client";
import { z } from "zod";

import { PostModel, PostVoteModel } from "~/lib/validators";

export const APIModelInputs = {
  "posts:POST": PostModel.omit({
    authorId: true,
    id: true,
    subredditId: true,
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
  "posts/[id]/vote": PostVoteModel.omit({ postId: true, userId: true }),
};

export interface APIModelOutputs {
  "posts:POST": {
    postId: string;
    subreddit: string;
  };
  "posts/[id]/vote": {
    vote: number;
    votes: number;
  };
  "subreddits/search:POST": {
    subreddit: Subreddit;
    subscribed: boolean;
  }[];
}
