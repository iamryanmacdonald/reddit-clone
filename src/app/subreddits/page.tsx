import { getServerSession } from "next-auth";

import SubredditGrid from "~/components/subreddit-grid";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";
import { subredditsWithSubscribers } from "~/lib/helpers";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const subreddits = await prisma.subreddit.findMany({
    include: {
      _count: {
        select: { subscribers: true },
      },
    },
    orderBy: [{ subscribers: { _count: "desc" } }],
    take: 25,
  });

  const data = await subredditsWithSubscribers(
    subreddits,
    session?.user.id ?? null,
  );

  return <SubredditGrid data={data} userId={session?.user.id ?? ""} />;
}
