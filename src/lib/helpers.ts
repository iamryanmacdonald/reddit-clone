import type { Subreddit } from "@prisma/client";

import { prisma } from "~/lib/db";

export async function subredditsWithSubscribers(
  subreddits: Subreddit[],
  userId: string | null,
) {
  const subscribedMap: { [key: string]: boolean } = {};

  if (userId) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        subscriberId: userId,
        subredditId: { in: subreddits.map((subreddit) => subreddit.id) },
      },
    });

    subscriptions.forEach(
      (subscription) => (subscribedMap[subscription.subredditId] = true),
    );
  }

  return subreddits.map((subreddit) => ({
    subreddit,
    subscribed: subscribedMap[subreddit.id] ?? false,
  }));
}
