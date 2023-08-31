import { clerkClient } from "@clerk/nextjs";
import { Post, Subreddit } from "@prisma/client";

import { prisma } from "~/lib/db";

export async function subredditsWithSubscribers(
  subreddits: Subreddit[],
  userId: string | null | undefined,
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

export async function postsToUserMap(posts: Post[]) {
  const userMap: { [key: string]: string } = {};

  const userIds = posts
    .map((post) => post.authorId)
    .filter((value, idx, array) => array.indexOf(value) === idx);

  const users = await clerkClient.users.getUserList({
    userId: userIds,
  });
  users.forEach((user) => (userMap[user.id] = user.username ?? "unknown"));

  return userMap;
}

export async function postsToVotesMap(posts: Post[]) {
  const votesMap: { [key: string]: number } = {};

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    const votesAgg = await prisma.postVote.aggregate({
      _sum: {
        vote: true,
      },
      where: {
        postId: post.id,
      },
    });

    votesMap[post.id] = votesAgg._sum.vote ?? 0;
  }

  return votesMap;
}
