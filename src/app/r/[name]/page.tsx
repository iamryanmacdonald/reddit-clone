import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import Post from "~/components/post";
import Sidebar from "~/components/sidebar";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

interface PageProps {
  params: {
    name: string;
  };
}

export default async function Page(props: PageProps) {
  const session = await getServerSession(authOptions);

  const { name } = props.params;

  const subreddit = await prisma.subreddit.findFirst({
    include: {
      moderators: true,
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
    where: {
      name,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex w-full">
      <div className="flex grow flex-col gap-4">
        {subreddit.posts.map((post) => {
          const vote =
            post.votes.find((vote) => vote.userId === session?.user.id)?.vote ??
            0;
          const votes = post.votes.reduce((total, { vote }) => total + vote, 0);

          return (
            <Post
              key={post.id}
              loggedIn={!!session}
              post={post}
              username={post.author.name ?? ""}
              vote={vote}
              votes={votes}
            />
          );
        })}
      </div>
      <div className="flex flex-col">
        <span className="px-6 py-4 text-xl">{subreddit.title}</span>
        <Sidebar subreddit={name} />
      </div>
    </div>
  );
}
