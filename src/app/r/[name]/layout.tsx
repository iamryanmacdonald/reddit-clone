import { type ReactNode } from "react";
import { notFound } from "next/navigation";

import Sidebar from "~/components/sidebar";
import { prisma } from "~/lib/db";

interface LayoutProps {
  children: ReactNode;
  params: {
    name: string;
  };
}

export default async function Layout({
  children,
  params: { name },
}: LayoutProps) {
  const subreddit = await prisma.subreddit.findFirst({
    where: {
      name,
    },
  });

  if (!subreddit) return notFound();

  return (
    <div className="flex w-full">
      <div className="flex grow">{children}</div>
      <div className="flex flex-col">
        <span className="px-6 py-4 text-xl">{subreddit.title}</span>
        <Sidebar subreddit={name} />
      </div>
    </div>
  );
}
