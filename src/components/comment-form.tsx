"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { CommentType } from "~/components/comment";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { APIModelInputs, APIModelOutputs } from "~/lib/api-models";

const formSchema = APIModelInputs["posts/[id]/comments:POST"];

interface CommentFormProps {
  parentId?: number;
  postId: number;
  setChildren?: (comment: CommentType) => void;
  setShowForm?: (value: boolean) => void;
}

export default function CommentForm(props: CommentFormProps) {
  const router = useRouter();
  const { parentId, postId, setChildren, setShowForm } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      content: "",
      parentId,
      postId,
    },
    resolver: zodResolver(formSchema),
  });

  const { isLoading, mutate } = useMutation({
    mutationFn: async (body: z.infer<typeof formSchema>) => {
      const res = await axios.post(`/api/posts/${postId}/comments`, body);

      return res.data as APIModelOutputs["posts/[id]/comments:POST"];
    },
    onSuccess: ({ comment }) => {
      setChildren ? setChildren(comment) : router.refresh();
      if (setShowForm) setShowForm(false);
      form.setValue("content", "");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
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
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2" disabled={isLoading}>
          Save
        </Button>
      </form>
    </Form>
  );
}
