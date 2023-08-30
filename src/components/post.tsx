"use client";

import { Post as PostType } from "@prisma/client";

import PostVote from "~/components/post-vote";

interface PostProps {
  post: PostType;
  username: string;
}

export default function Post(props: PostProps) {
  const { post, username } = props;

  return (
    <div className="rounded-md border">
      <div className="flex gap-2">
        <PostVote />
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
