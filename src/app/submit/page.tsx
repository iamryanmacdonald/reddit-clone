import { auth } from "@clerk/nextjs";

import PostForm from "~/components/post-form";
import { prisma } from "~/lib/db";
import { subredditsWithSubscribers } from "~/lib/helpers";

export default async function Page() {
  const { userId } = auth();

  const subreddits = await prisma.subreddit.findMany({
    include: {
      _count: {
        select: { subscribers: true },
      },
    },
    orderBy: [{ subscribers: { _count: "desc" } }],
    take: 25,
  });

  const data = await subredditsWithSubscribers(subreddits, userId);

  return (
    <div className="mx-auto mt-8 w-1/2">
      <PostForm />
    </div>
  );
}
