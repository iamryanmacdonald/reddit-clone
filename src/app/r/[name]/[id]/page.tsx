import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import moment from "moment";
import { getServerSession } from "next-auth";

import PostVote, { type VoteType } from "~/components/post-vote";
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

  return (
    <div className="flex h-fit w-full gap-4 border border-accent bg-muted py-2">
      <PostVote
        loggedIn={!!session}
        postId={post.id}
        vote={vote as VoteType}
        votes={votes}
      />
      <div className="flex flex-col">
        <span className="text-xl font-semibold hover:underline">
          {post.url ? <Link href={post.url}>{post.title}</Link> : post.title}
        </span>
        <span className="text-sm font-thin text-opacity-75">
          Submitted {moment(post.createdAt).fromNow()} by {post.author.name}
        </span>
        <p className="mt-2">{post.content}</p>
      </div>
    </div>
  );
}
