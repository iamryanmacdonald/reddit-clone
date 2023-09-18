import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Comment as CommentType } from "@prisma/client";
import moment from "moment";
import { getServerSession } from "next-auth";

import Comment, { CommentsType } from "~/components/comment";
import CommentForm from "~/components/comment-form";
import PostVote from "~/components/post-vote";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";
import { VoteType } from "~/lib/types";

interface PageProps {
  params: {
    id: string;
    name: string;
  };
}

export default async function Page(props: PageProps) {
  const { name } = props.params;
  const id = parseInt(props.params.id);
  if (isNaN(id)) return redirect("/");

  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    include: {
      author: true,
      votes: true,
    },
    where: {
      id,
      subreddit: {
        name,
      },
    },
  });

  if (!post) return notFound();

  const vote =
    post.votes.find((vote) => vote.userId === session?.user.id)?.vote ?? 0;
  const votes = post.votes.reduce((total, { vote }) => total + vote, 0);

  const commentsRaw = await prisma.comment.findMany({
    include: {
      author: true,
      votes: true,
    },
    orderBy: [{ createdAt: "asc" }],
    where: {
      postId: post.id,
    },
  });
  const commentsTree = commentsRaw.reduce(
    (comments, comment) => {
      comments[comment.id] = { comment, children: [] };

      if (comment.parentId) {
        const parent = comments[comment.parentId];
        parent.children.push(comments[comment.id]);
      }

      return comments;
    },
    {} as { [key: number]: CommentsType },
  );
  const comments = Object.values(commentsTree).filter(
    ({ comment }) => comment.parentId === null,
  );
  console.log(commentsTree);

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col border border-accent bg-muted">
        <div className="flex h-fit gap-4 py-2">
          <PostVote
            loggedIn={!!session}
            postId={post.id}
            vote={vote as VoteType}
            votes={votes}
          />
          <div className="flex flex-col">
            <span className="text-xl font-semibold hover:underline">
              {post.url ? (
                <Link href={post.url}>{post.title}</Link>
              ) : (
                post.title
              )}
            </span>
            <span className="text-sm font-thin text-opacity-75">
              Submitted {moment(post.createdAt).fromNow()} by {post.author.name}
            </span>
            <p className="mt-2">{post.content}</p>
          </div>
        </div>
        <div className="border-t border-accent p-4">
          <div className="w-1/3">
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
      <span className="ml-2 mt-2 text-muted-foreground">
        {comments.length > 0
          ? `all ${comments.length} comments`
          : "no comments (yet)"}
      </span>
      <div className="flex flex-col gap-1">
        {comments.map(({ children, comment }) => {
          const vote =
            comment.votes.find((vote) => vote.userId === session?.user.id)
              ?.vote ?? 0;

          return (
            <Comment
              key={comment.id}
              childComments={children}
              comment={comment}
              session={session}
              vote={vote}
            />
          );
        })}
      </div>
    </div>
  );
}
