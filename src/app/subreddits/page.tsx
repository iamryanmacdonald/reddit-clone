import { auth } from "@clerk/nextjs";

import SubredditGrid from "~/components/subreddit-grid";
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

  return <SubredditGrid data={data} userId={userId} />;
}
