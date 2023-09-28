import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import Comment, { CommentsType } from "~/components/comment";
import SubredditPost from "~/components/subreddit-post";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

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
      saves: true,
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

  return (
    <div className="flex w-full flex-col">
      <SubredditPost
        post={post}
        saved={
          session
            ? post.saves.map((save) => save.userId).includes(session.user.id)
            : false
        }
        session={session}
        vote={vote}
        votes={votes}
      />
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
