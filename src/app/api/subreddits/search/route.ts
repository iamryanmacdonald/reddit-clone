import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { z } from "zod";

import { prisma } from "~/lib/db";
import { subredditsWithSubscribers } from "~/lib/helpers";

export async function POST(req: Request) {
  try {
    // Pull inputs from the request
    const body = await req.json();
    const data = z.object({ input: z.string() }).parse(body);

    // Find list of subreddits with a similar name or title
    const subreddits = await prisma.subreddit.findMany({
      orderBy: [{ name: "asc" }, { title: "asc" }],
      where: {
        OR: [
          {
            name: {
              contains: data.input,
            },
          },
          {
            title: {
              contains: data.input,
            },
          },
        ],
      },
    });

    // Check if an authenticated user is making this request
    const { userId } = auth();

    // Map subscriptions to subreddits
    const mappedSubreddits = await subredditsWithSubscribers(
      subreddits,
      userId,
    );

    // Return list of subreddits with subscription mapping
    return new NextResponse(JSON.stringify(mappedSubreddits));
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error searching for subreddit(s)", {
      status: 500,
    });
  }
}
