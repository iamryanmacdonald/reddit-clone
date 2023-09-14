"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { z } from "zod";

import { APIModelInputs, APIModelOutputs } from "~/lib/api-models";

export type VoteType = -1 | 0 | 1;

interface PostVoteProps {
  loggedIn: boolean;
  postId: number;
  vote?: VoteType;
  votes?: number;
}

export default function PostVote(props: PostVoteProps) {
  const { loggedIn } = props;
  const [vote, setVote] = useState(props.vote ?? 0);
  const [votes, setVotes] = useState(props.votes ?? 0);

  const { isLoading, mutate } = useMutation({
    mutationFn: async (
      body: z.infer<(typeof APIModelInputs)["posts/[id]/vote:POST"]>,
    ) => {
      const res = await axios.post(`/api/posts/${props.postId}/vote`, body);

      return res.data as APIModelOutputs["posts/[id]/vote:POST"];
    },
    onSuccess: ({ vote, votes }) => {
      setVote(vote as VoteType);
      setVotes(votes);
    },
  });

  return (
    <div className="flex flex-col items-center gap-1 p-2">
      <ArrowBigUp
        className={`h-8 w-8 ${
          !loggedIn
            ? "fill-gray-500 text-gray-500 opacity-10"
            : isLoading
            ? "fill-gray-500 text-gray-500 opacity-75"
            : vote === 1
            ? "fill-orange-500 text-orange-500 hover:fill-inherit hover:text-inherit"
            : "hover:fill-orange-500 hover:text-orange-500"
        }`}
        onClick={() => {
          if (!isLoading && loggedIn) mutate({ vote: vote === 1 ? 0 : 1 });
        }}
      />
      <span className="text-lg">{votes}</span>
      <ArrowBigDown
        className={`h-8 w-8 ${
          !loggedIn
            ? "fill-gray-500 text-gray-500 opacity-10"
            : isLoading
            ? "fill-gray-500 text-gray-500 opacity-75"
            : vote === -1
            ? "fill-orange-500 text-orange-500 hover:fill-inherit hover:text-inherit"
            : "hover:fill-orange-500 hover:text-orange-500"
        }`}
        onClick={() => {
          if (!isLoading && loggedIn) mutate({ vote: vote === -1 ? 0 : -1 });
        }}
      />
    </div>
  );
}
