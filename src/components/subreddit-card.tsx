import { useState } from "react";
import Link from "next/link";
import { Subreddit } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Cross, Loader2, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface SubredditCardProps {
  subreddit: Subreddit;
  subscribed: boolean;
  userId: string | null | undefined;
}

export default function SubredditCard(props: SubredditCardProps) {
  const { subreddit, userId } = props;

  const [subscribed, setSubscribed] = useState(props.subscribed);

  const { isLoading: isChangingSubscription, mutate: changeSubscription } =
    useMutation({
      mutationFn: async (value: boolean) => {
        if (!userId) return false;

        const res = await axios.put(`/api/subscriptions`, {
          subredditId: subreddit.id,
          value,
        });

        return res.data as boolean;
      },
      onSuccess: (value: boolean) => setSubscribed(value),
    });

  return (
    <Card key={subreddit.id}>
      <CardHeader>
        <CardTitle>{subreddit.title}</CardTitle>
        <CardDescription>{subreddit.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-2">
        {userId && (
          <Button
            className="flex grow basis-0 items-center gap-2 hover:cursor-pointer"
            disabled={isChangingSubscription}
            onClick={() => changeSubscription(!subscribed)}
            variant={subscribed ? "destructive" : "default"}
          >
            {subscribed ? (
              <>
                {isChangingSubscription ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}{" "}
                Unsubscribe
              </>
            ) : (
              <>
                {isChangingSubscription ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Cross className="h-5 w-5" />
                )}{" "}
                Subscribe
              </>
            )}
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link className="grow basis-0" href={`/r/${subreddit.name}`}>
            Visit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
