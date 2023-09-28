"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { type Session } from "next-auth";
import InfiniteScroll from "react-infinite-scroll-component";

import Post from "~/components/post";
import { APIModelOutputs } from "~/lib/api-models";

interface PostFeedProps {
  saved?: boolean;
  session: Session | null;
  subreddit?: string;
}

export default function PostFeed(props: PostFeedProps) {
  const { saved, session, subreddit } = props;

  const { data, fetchNextPage, hasNextPage, isLoading, refetch } =
    useInfiniteQuery(
      ["post-feed"],
      async ({ pageParam }) => {
        let url = "/api/posts?take=20";
        if (pageParam) url += "&after=" + pageParam;
        if (saved) url += "&saved=true";
        if (subreddit) url += "&subreddit=" + subreddit;

        const res = await axios.get(url);

        return res.data as APIModelOutputs["posts:GET"];
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  if (isLoading)
    return (
      <div className="grow">
        <Loader2 className="mx-auto mt-16 h-16 w-16 animate-spin" />
      </div>
    );

  const posts = data?.pages.flatMap((page) => page.posts);

  if (posts && posts.length === 0)
    return <div className="font-lg grow py-4 text-center">No posts found.</div>;

  return (
    <div className="h-full w-full">
      <InfiniteScroll
        dataLength={posts?.length || 0}
        endMessage={
          <div className="font-lg py-4 text-center">No more posts found.</div>
        }
        hasMore={hasNextPage ?? false}
        loader={<Loader2 className="mx-auto mt-16 h-16 w-16 animate-spin" />}
        next={fetchNextPage}
      >
        {posts?.map(({ post, saved }) => {
          const vote =
            post.votes.find((vote) => vote.userId === session?.user.id)?.vote ??
            0;
          const votes = post.votes.reduce((total, { vote }) => total + vote, 0);

          return (
            <Post
              key={post.id}
              loggedIn={!!session}
              post={post}
              refetch={true}
              refetchFunction={refetch}
              saved={saved}
              username={post.author.name ?? ""}
              vote={vote}
              votes={votes}
            />
          );
        })}
      </InfiniteScroll>
    </div>
  );

  // return <div className="flex flex-col gap-4"></div>;
}
