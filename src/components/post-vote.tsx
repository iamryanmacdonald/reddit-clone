"use client";

import { useState } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";

interface PostVoteProps {
  vote?: -1 | 0 | 1;
  votes?: number;
}

export default function PostVote(props: PostVoteProps) {
  const [vote, setVote] = useState(props.vote ?? 0);
  const [votes, setVotes] = useState(props.votes ?? 0);

  const color = "orange-500";

  return (
    <div className="flex flex-col items-center gap-1 p-2">
      <ArrowBigUp
        className={`h-8 w-8 ${
          vote === 1
            ? `fill-${color} text-${color} hover:fill-inherit hover:text-inherit`
            : `hover:fill-${color} hover:text-${color}`
        }`}
        onClick={() => {
          if (vote === 1) {
            setVote(0);
            setVotes(votes - 1);
          } else {
            setVote(1);
            setVotes(votes + 1 - vote);
          }
        }}
      />
      <span className="text-lg">{votes}</span>
      <ArrowBigDown
        className={`h-8 w-8 ${
          vote === -1
            ? `fill-${color} text-${color} hover:fill-inherit hover:text-inherit`
            : `hover:fill-${color} hover:text-${color}`
        }`}
        onClick={() => {
          if (vote === -1) {
            setVote(0);
            setVotes(votes + 1);
          } else {
            setVote(-1);
            setVotes(votes - 1 - vote);
          }
        }}
      />
    </div>
  );
}
