import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs";

import { prisma } from "~/lib/db";

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
      posts: true,
    },
    where: {
      name,
    },
  });

  if (!subreddit) return notFound();

  return <div>{JSON.stringify(subreddit)}</div>;
}
