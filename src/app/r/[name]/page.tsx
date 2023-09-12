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
  const session = await getServerSession(authOptions);

  return <PostFeed session={session} subreddit={name} />;
}
