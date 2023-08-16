import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { z } from "zod";

import { prisma } from "~/lib/db";
import { SubredditModel } from "~/lib/validators";

export async function POST(req: Request) {
  try {
    // Make sure the user is authorized
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Pull inputs from the request
    const body = await req.json();
    const data = SubredditModel.omit({ id: true }).parse(body);

    // Check if there is a subreddit that exists with the name
    const existingSubreddit = await prisma.subreddit.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingSubreddit)
      return new NextResponse("Subreddit already exists", { status: 409 });

    // Batch these operations to ensure that they either all commit, or none of them commit
    const subreddit = await prisma.$transaction(async (tx) => {
      // Create the new subreddit
      const subreddit = await prisma.subreddit.create({
        data,
      });
      // Set the user creating the subreddit as head moderator
      await prisma.moderator.create({
        data: {
          head: true,
          moderatorId: userId,
          subredditId: subreddit.id,
        },
      });
      // Subscribe the user to the newly created subreddit
      await prisma.subscription.create({
        data: {
          subscriberId: userId,
          subredditId: subreddit.id,
        },
      });

      return subreddit;
    });

    // Return the subreddit name to allow user to redirect
    return new NextResponse(subreddit.name);
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error creating subreddit", { status: 500 });
  }
}
