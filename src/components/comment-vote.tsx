import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { z } from "zod";

import { APIModelInputs, APIModelOutputs } from "~/lib/api-models";
import { VoteType } from "~/lib/types";

interface CommentVoteProps {
  commentId: number;
  loggedIn: boolean;
  setPoints: (value: number) => void;
  vote?: VoteType;
}

export default function CommentVote(props: CommentVoteProps) {
  const { loggedIn, setPoints } = props;
  const [vote, setVote] = useState(props.vote ?? 0);

  const { isLoading, mutate } = useMutation({
    mutationFn: async (
      body: z.infer<(typeof APIModelInputs)["comments/[id]/vote:POST"]>,
    ) => {
      const res = await axios.post(
        `/api/comments/${props.commentId}/vote`,
        body,
      );

      return res.data as APIModelOutputs["comments/[id]/vote:POST"];
    },
    onSuccess: ({ vote, votes }) => {
      setVote(vote as VoteType);
      setPoints(votes);
    },
  });

  return (
    <div className="flex flex-col items-center gap-1 p-1">
      <ArrowBigUp
        className={`h-6 w-6 ${
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
      <ArrowBigDown
        className={`h-6 w-6 ${
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
