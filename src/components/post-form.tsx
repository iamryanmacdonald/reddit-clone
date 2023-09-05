"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Subreddit } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import axios from "axios";
import { CommandEmpty } from "cmdk";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { APIModelInputs, APIModelOutputs } from "~/lib/api-models";

const formSchema = APIModelInputs["posts:POST"];

interface PostFormProps {
  className?: string;
  subreddit?: Subreddit;
}

export default function PostForm(props: PostFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramsType = searchParams.get("type");
  const postType = (
    paramsType
      ? ["link", "text"].includes(paramsType)
        ? paramsType
        : "link"
      : "link"
  ) as "link" | "text";

  const [open, setOpen] = useState(false);
  const [subredditTitle, setSubredditTitle] = useState<string | null>(
    props.subreddit?.title || null,
  );
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 1000);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      content: "",
      subreddit: props.subreddit?.name || "",
      title: "",
      url: "",
    },
    resolver: zodResolver(formSchema),
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: async (body: z.infer<typeof formSchema>) => {
      const res = await axios.post("/api/posts", body);

      return res.data as APIModelOutputs["posts:POST"];
    },
    onSuccess: ({ postId, subreddit }) => {
      router.push(`/r/${subreddit}/${postId}`);
    },
  });

  const {
    data: subreddits,
    isFetched: subredditsFetched,
    isFetching: subredditsFetching,
  } = useQuery(["subreddits", debouncedInput], {
    queryFn: async () => {
      if (debouncedInput.length < 1) return [];

      const res = await axios.post(`/api/subreddits/search`, {
        input: debouncedInput,
      });

      return res.data as APIModelOutputs["subreddits/search:POST"];
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };
  return (
    <div className={`bg-background ${props.className}`}>
      <Tabs defaultValue={postType}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="link">link</TabsTrigger>
          <TabsTrigger value="text">text</TabsTrigger>
        </TabsList>
        <Form {...form}>
          <form className="mt-4" onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="link">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>url</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      The URL that will be used as a link on the post.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isLoading} />
                  </FormControl>
                  <FormDescription>The title of the post.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TabsContent value="text">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      The text that will be displayed on the post.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            <FormField
              control={form.control}
              name="subreddit"
              render={() => (
                <FormItem className="mt-4">
                  <FormLabel>subreddit</FormLabel>
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          aria-expanded={open}
                          className="w-full justify-between"
                          disabled={!!props.subreddit}
                          role="combobox"
                          variant="outline"
                        >
                          {subredditTitle ?? "Select a subreddit..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="PopoverContent p-0">
                        <Command>
                          <CommandInput
                            disabled={subredditsFetching}
                            onValueChange={(value) => setInput(value)}
                            placeholder="Search for a subreddit..."
                            value={input}
                          />
                          {debouncedInput.length > 0 && (
                            <CommandList>
                              {subredditsFetched && (
                                <CommandEmpty className="py-2 text-center">
                                  No subreddits found.
                                </CommandEmpty>
                              )}
                              {subreddits && subreddits.length > 0 && (
                                <CommandGroup>
                                  {subreddits.map(({ subreddit }) => (
                                    <CommandItem
                                      key={subreddit.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "subreddit",
                                          subreddit.name,
                                        );
                                        setSubredditTitle(subreddit.title);
                                        setOpen(false);
                                      }}
                                      value={subreddit.name}
                                    >
                                      {subreddit.title}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription>
                    The subreddit in which the post will be posted.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4" disabled={isLoading}>
              Submit
            </Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
