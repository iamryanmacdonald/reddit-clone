import { notFound } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs";

import Post from "~/components/post";
import Sidebar from "~/components/sidebar";
import { prisma } from "~/lib/db";
import { postsToUserMap, postsToVotesMap } from "~/lib/helpers";

interface PageProps {
  params: {
    name: string;
  };
}

export default async function Page(props: PageProps) {
  const { userId } = auth();

  const { name } = props.params;

  const subreddit = await prisma.subreddit.findFirst({
    include: {
      moderators: true,
      posts: {
        include: {
          votes: true,
        },
        orderBy: [],
      },
    },
    where: {
      name,
    },
  });

  if (!subreddit) return notFound();

  const users = await postsToUserMap(subreddit.posts);
  const votes = await postsToVotesMap(subreddit.posts);

  return (
    <div className="flex w-full">
      <div className="flex grow flex-col gap-4">
        {subreddit.posts.map((post) => (
          <Post
            key={post.id}
            loggedIn={!!userId}
            post={post}
            username={users[post.authorId]}
            vote={post.votes.find((vote) => vote.userId === userId)?.vote ?? 0}
            votes={votes[post.id] ?? 0}
          />
        ))}
      </div>
      <div className="flex flex-col">
        <span className="px-6 py-4 text-xl">{subreddit.title}</span>
        <Sidebar subreddit={name} />
      </div>
    </div>
  );
}
