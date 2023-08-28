import { notFound } from "next/navigation";

import PostForm from "~/components/post-form";
import { prisma } from "~/lib/db";

interface PageProps {
  params: {
    name: string;
  };
}

export default async function Page(props: PageProps) {
  const { name } = props.params;

  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="mx-auto mt-8 w-1/2">
      <PostForm subreddit={subreddit} />
    </div>
  );
}
