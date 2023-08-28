"use client";

import { useState } from "react";
import { Subreddit } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import axios from "axios";
import { Loader2 } from "lucide-react";

import SubredditCard from "~/components/subreddit-card";
import { Input } from "~/components/ui/input";
import { APIModelOutputs } from "~/lib/api-models";

interface SubredditGridProps {
  data: APIModelOutputs["subreddits/search:POST"];
  userId: string | null | undefined;
}

export default function SubredditGrid(props: SubredditGridProps) {
  const { data, userId } = props;

  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 1000);

  const {
    data: subreddits,
    isFetched: subredditsFetched,
    isFetching: subredditsFetching,
  } = useQuery(["subreddits", debouncedInput], {
    initialData: data,
    queryFn: async () => {
      if (debouncedInput.length < 1) return data;

      const res = await axios.post(`/api/subreddits/search`, {
        input: debouncedInput,
      });

      return res.data as APIModelOutputs["subreddits/search:POST"];
    },
  });

  return (
    <div className="mt-2 flex flex-col gap-4">
      <Input
        onChange={(e) => {
          e.preventDefault();
          setInput(e.target.value);
        }}
        placeholder="Search for a subreddit..."
        value={input}
      />
      {subredditsFetching ? (
        <Loader2 className="mx-auto h-16 w-16 animate-spin" />
      ) : (
        subredditsFetched &&
        subreddits &&
        (subreddits.length > 0 ? (
          <div className="grid grid-cols-5 gap-4">
            {subreddits.map(({ subreddit, subscribed }) => (
              <SubredditCard
                key={subreddit.id}
                subreddit={subreddit}
                subscribed={subscribed}
                userId={userId}
              />
            ))}
          </div>
        ) : (
          <span className="mx-auto text-xl">No subreddits found.</span>
        ))
      )}
    </div>
  );
}
