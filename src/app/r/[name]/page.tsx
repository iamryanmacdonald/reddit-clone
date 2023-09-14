import { getServerSession } from "next-auth";

import PostFeed from "~/components/post-feed";
import { authOptions } from "~/lib/auth";

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
