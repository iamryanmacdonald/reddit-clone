import Link from "next/link";

import { Button } from "~/components/ui/button";

interface SidebarProps {
  subreddit?: string;
}

export default function Sidebar({ subreddit }: SidebarProps) {
  return (
    <aside className="flex w-96 shrink-0 flex-col gap-4 px-4 py-2">
      <Button className="w-full" variant="secondary" asChild>
        <Link href={`${subreddit}/submit`}>Submit a link</Link>
      </Button>
      <Button className="w-full" variant="secondary" asChild>
        <Link href={`${subreddit}/submit?type=text`}>Submit a text post</Link>
      </Button>
    </aside>
  );
}
