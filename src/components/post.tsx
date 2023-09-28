import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";

import PostVote from "~/components/post-vote";
import { APIModelInputs, APIModelOutputs } from "~/lib/api-models";
import { VoteType } from "~/lib/types";
import { CompletePost } from "~/lib/validators";

interface PostProps {
  loggedIn: boolean;
  post: CompletePost;
  refetch?: boolean;
  refetchFunction?: () => void;
  saved: boolean;
  username: string;
  vote: number;
  votes: number;
}

export default function Post(props: PostProps) {
  const { loggedIn, post, refetch, refetchFunction, username, vote, votes } =
    props;

  const router = useRouter();
  const [saved, setSaved] = useState(props.saved);

  const { isLoading, mutate } = useMutation({
    mutationFn: async (
      body: z.infer<(typeof APIModelInputs)["posts/[id]/save:POST"]>,
    ) => {
      const res = await axios.post(`/api/posts/${post.id}/save`, body);

      return res.data as APIModelOutputs["posts/[id]/save:POST"];
    },
    onSuccess: ({ saved }) => {
      setSaved(saved);
      if (refetch && refetchFunction) refetchFunction();
    },
  });

  return (
    <div className="mb-2 rounded-md border px-4">
      <div className="flex gap-4">
        <PostVote
          loggedIn={loggedIn}
          postId={post.id}
          vote={vote as VoteType}
          votes={votes}
        />
        <div className="flex flex-col justify-between py-2">
          <div className="flex flex-col">
            <div className="text-xl font-semibold hover:underline">
              <Link href={post.url ?? `/r/${post.subreddit.name}/${post.id}`}>
                {post.title}
              </Link>
            </div>
            <div>by {username}</div>
          </div>
          <div className="mt-1 flex items-center gap-4">
            <Link href={`/r/${post.subreddit.name}/${post.id}`}>
              <div className="rounded-md px-2 py-1 hover:cursor-pointer hover:bg-secondary">
                {post.comments.length} comments
              </div>
            </Link>
            <div
              className={`rounded-md px-2 py-1 hover:cursor-pointer ${
                isLoading
                  ? "bg-muted opacity-50 hover:bg-muted"
                  : "hover:bg-secondary"
              }`}
              onClick={() => !isLoading && mutate({ save: !saved })}
            >
              {saved ? "unsave" : "save"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
