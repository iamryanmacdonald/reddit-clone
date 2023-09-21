"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Post, PostVote as PostVoteType, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import { Session } from "next-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";

import CommentForm from "~/components/comment-form";
import PostVote from "~/components/post-vote";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { APIModelInputs, APIModelOutputs } from "~/lib/api-models";
import { VoteType } from "~/lib/types";

import { Button } from "./ui/button";

const formSchema = APIModelInputs["posts/[id]:PATCH"];

interface SubredditPostProps {
  post: Post & { author: User; votes: PostVoteType[] };
  session: Session | null;
  vote: number;
  votes: number;
}

export default function SubredditPost(props: SubredditPostProps) {
  const { post, session, vote, votes } = props;

  const [content, setContent] = useState(post.content);
  const [edit, setEdit] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      content,
    },
    resolver: zodResolver(formSchema),
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: async (body: z.infer<typeof formSchema>) => {
      const res = await axios.patch(`/api/posts/${post.id}`, body);

      return res.data as APIModelOutputs["posts/[id]:PATCH"];
    },
    onSuccess: ({ content }) => {
      setEdit(false);
      setContent(content);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <div className="flex flex-col border border-accent bg-muted">
      <div className="flex h-fit gap-4 py-2">
        <PostVote
          loggedIn={!!session}
          postId={post.id}
          vote={vote as VoteType}
          votes={votes}
        />
        <div className="flex grow flex-col justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-semibold hover:underline">
              {post.url ? (
                <Link href={post.url}>{post.title}</Link>
              ) : (
                post.title
              )}
            </span>
            <span className="text-sm font-thin text-opacity-75">
              Submitted {moment(post.createdAt).fromNow()} by {post.author.name}
            </span>
            {edit ? (
              <div className="my-2 w-1/3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-accent"
                              disabled={isLoading}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="mt-2" disabled={isLoading}>
                      Save
                    </Button>
                  </form>
                </Form>
              </div>
            ) : (
              <p className="my-2">{content}</p>
            )}
          </div>
          <div className="flex">
            {session?.user.id === post.authorId && post.content && (
              <span
                className="text-sm opacity-75 hover:cursor-pointer"
                onClick={() => setEdit(!edit)}
              >
                edit
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-accent p-4">
        <div className="w-1/3">
          <CommentForm postId={post.id} />
        </div>
      </div>
    </div>
  );
}
