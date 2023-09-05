import { Post as PostType } from "@prisma/client";

import PostVote, { VoteType } from "~/components/post-vote";

interface PostProps {
  loggedIn: boolean;
  post: PostType;
  username: string;
  vote: number;
  votes: number;
}

export default function Post(props: PostProps) {
  const { loggedIn, post, username, vote, votes } = props;

  return (
    <div className="rounded-md border px-4">
      <div className="flex gap-2">
        {loggedIn && (
          <PostVote postId={post.id} vote={vote as VoteType} votes={votes} />
        )}
        <div className="flex flex-col justify-between py-2">
          <div className="flex flex-col">
            <div className="text-xl font-semibold">{post.title}</div>
            <div>by {username}</div>
          </div>
          <div className="mt-1 flex gap-4">
            <div>0 comments</div>
            <div>save</div>
          </div>
        </div>
      </div>
    </div>
  );
}
