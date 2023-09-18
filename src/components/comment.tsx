"use client";

import { useState } from "react";
import {
  Comment as BaseCommentType,
  CommentVote as CommentVoteType,
  User,
} from "@prisma/client";
import { CrossIcon, MinusSquare, PlusSquare } from "lucide-react";
import { Session } from "next-auth";

import CommentForm from "~/components/comment-form";
import CommentVote from "~/components/comment-vote";
import { VoteType } from "~/lib/types";

export interface CommentType extends BaseCommentType {
  author: User;
  votes: CommentVoteType[];
}

export interface CommentsType {
  comment: CommentType;
  children: CommentsType[];
}

interface CommentProps {
  child?: boolean;
  childComments: CommentsType[];
  comment: CommentType;
  session: Session | null;
  vote: number;
}

export default function Comment(props: CommentProps) {
  const { child, comment, session, vote } = props;
  const [children, setChildren] = useState(props.childComments);

  const [showComment, setShowComment] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [points, setPoints] = useState(
    comment.votes.reduce((total, vote) => total + vote.vote, 0),
  );

  return (
    <div
      className={`flex flex-col rounded-md ${
        child ? "border-l border-t" : "border"
      }`}
    >
      <div className="flex items-center gap-1 p-1 text-sm">
        {showComment ? (
          <MinusSquare
            className="h-4 w-4 cursor-pointer"
            onClick={() => setShowComment(false)}
          />
        ) : (
          <PlusSquare
            className="h-4 w-4 cursor-pointer"
            onClick={() => setShowComment(true)}
          />
        )}
        <span className="ml-2">{comment.author.name}</span>
        <span>·</span>
        <span>
          {points} point{points === 1 ? "" : "s"}
        </span>
      </div>
      {showComment && (
        <div className="flex gap-2">
          <CommentVote
            commentId={comment.id}
            loggedIn={!!session}
            setPoints={setPoints}
            vote={vote as VoteType}
          />
          <div className="flex flex-col justify-between">
            <p>{comment.content}</p>
            <div className="mb-1 flex">
              <span
                className="text-sm opacity-75 hover:cursor-pointer"
                onClick={() => setShowForm(!showForm)}
              >
                reply
              </span>
            </div>
          </div>
        </div>
      )}
      {showComment && showForm && (
        <div className="my-2 ml-4 w-1/3">
          <CommentForm
            parentId={comment.id}
            postId={comment.postId}
            setChildren={(comment: CommentType) =>
              setChildren([...children, { comment, children: [] }])
            }
            setShowForm={setShowForm}
          />
        </div>
      )}
      {showComment && (
        <div className="ml-2">
          {children.map(({ children, comment }) => {
            const vote =
              comment.votes.find((vote) => vote.userId === session?.user.id)
                ?.vote ?? 0;

            return (
              <Comment
                key={comment.id}
                child={true}
                childComments={children}
                comment={comment}
                session={session}
                vote={vote}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
