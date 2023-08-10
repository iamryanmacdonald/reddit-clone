"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { SubredditModel } from "~/lib/validators";

const formSchema = SubredditModel.omit({ id: true });

export default function Page() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      description: "",
      name: "",
      title: "",
    },
    resolver: zodResolver(formSchema),
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: async (body: z.infer<typeof formSchema>) => {
      const res = await axios.post("/api/subreddits", body);

      return res.data as string;
    },
    onSuccess: (subreddit) => {
      router.push(`/r/${subreddit}`);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <div className="mx-auto mt-8 w-1/2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  The name of the subreddit. Minimum length of 3 characters,
                  maximum length of 21 characters, no spaces allowed. Once
                  created, this cannot be changed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>title</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Title of the subreddit. Can be anything you want up to a
                  maximum of 50 characters. This is shown at the top of the
                  subreddit. If empty, the name will be used as the title
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>description</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Description for your subreddit. Can be anything you want up to
                  a maximum of 500 characters. This is shown to the side of the
                  subreddit.
                </FormDescription>
              </FormItem>
            )}
          ></FormField>
          <Button type="submit" disabled={isLoading}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
