import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";
import { SubredditModel } from "~/lib/validators";

export async function POST(req: Request) {
  try {
    // Make sure the user is authorized
    const session = await getServerSession(authOptions);

    if (!session) return new NextResponse("Unauthorized", { status: 401 });

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
      const subreddit = await tx.subreddit.create({
        data,
      });
      // Set the user creating the subreddit as head moderator
      await tx.moderator.create({
        data: {
          head: true,
          moderatorId: session.user.id,
          subredditId: subreddit.id,
        },
      });
      // Subscribe the user to the newly created subreddit
      await tx.subscription.create({
        data: {
          subscriberId: session.user.id,
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
