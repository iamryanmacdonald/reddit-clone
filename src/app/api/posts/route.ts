import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { APIModelInputs } from "~/lib/api-models";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

export async function POST(req: Request) {
  try {
    // Make sure the user is authorized
    const session = await getServerSession(authOptions);

    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // Pull inputs from the request
    const body = await req.json();
    const data = APIModelInputs["posts:POST"].parse(body);

    // Check if the subreddit exists
    const subreddit = await prisma.subreddit.findUnique({
      where: {
        name: data.subreddit,
      },
    });

    if (!subreddit)
      return new NextResponse("Subreddit does not exist", { status: 404 });

    // Batch post creation and upvote creation
    const post = await prisma.$transaction(async (tx) => {
      // Create the post
      const post = await prisma.post.create({
        data: {
          authorId: session.user.id,
          content: data.content,
          subredditId: subreddit.id,
          title: data.title,
          url: data.url,
        },
      });
      // Create an upvote for the user to the post
      await prisma.postVote.create({
        data: {
          postId: post.id,
          userId: session.user.id,
          vote: 1,
        },
      });

      return post;
    });

    // Return the post ID to allow user to redirect
    return new NextResponse(
      JSON.stringify({ postId: post.id, subreddit: subreddit.name }),
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error creating post", { status: 500 });
  }
}
