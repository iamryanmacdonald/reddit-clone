import { getServerSession } from "next-auth";

import PostFeed from "~/components/post-feed";
import Sidebar from "~/components/sidebar";
import { authOptions } from "~/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex">
      <div className="grow">
        <PostFeed saved={true} session={session} />
      </div>
    </div>
  );
}
