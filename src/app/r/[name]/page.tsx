import { getServerSession } from "next-auth";

import Post from "~/components/post";
import PostFeed from "~/components/post-feed";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

interface PageProps {
  params: {
    name: string;
  };
}

export default async function Page(props: PageProps) {
  const { name } = props.params;

  return <PostFeed subreddit={name} />;

  // return (
  //   <>
  //     {posts.map((post) => {
  //       const vote =
  //         post.votes.find((vote) => vote.userId === session?.user.id)?.vote ??
  //         0;
  //       const votes = post.votes.reduce((total, { vote }) => total + vote, 0);

  //       return (
  //         <Post
  //           key={post.id}
  //           loggedIn={!!session}
  //           post={post}
  //           username={post.author.name ?? ""}
  //           vote={vote}
  //           votes={votes}
  //         />
  //       );
  //     })}
  //   </>
  // );
}
