import { notFound } from "next/navigation";
import { clerkClient } from "@clerk/nextjs";

import Post from "~/components/post";
import Sidebar from "~/components/sidebar";
import { prisma } from "~/lib/db";
import { postsToUserMap } from "~/lib/helpers";

interface PageProps {
  params: {
    name: string;
  };
}

export default async function Page(props: PageProps) {
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

  return (
    <div className="flex w-full">
      <div className="flex grow flex-col gap-4">
        {subreddit.posts.map((post) => (
          <Post key={post.id} post={post} username={users[post.authorId]} />
        ))}
      </div>
      <div className="flex flex-col">
        <span className="px-6 py-4 text-xl">{subreddit.title}</span>
        <Sidebar subreddit={name} />
      </div>
    </div>
  );
}
