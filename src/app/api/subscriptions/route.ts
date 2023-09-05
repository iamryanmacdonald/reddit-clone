import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

export async function PUT(req: Request) {
  try {
    // Make sure the user is authorized
    const session = await getServerSession(authOptions);

    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // Pull inputs from the request
    const body = await req.json();
    const data = z
      .object({
        subredditId: z.string(),
        value: z.boolean(),
      })
      .parse(body);

    // Either delete or insert subscription, based on value
    if (data.value) {
      await prisma.subscription.create({
        data: {
          subredditId: data.subredditId,
          subscriberId: session.user.id,
        },
      });

      return new NextResponse(JSON.stringify(true));
    } else {
      await prisma.subscription.delete({
        where: {
          subredditId_subscriberId: {
            subredditId: data.subredditId,
            subscriberId: session.user.id,
          },
        },
      });

      return new NextResponse(JSON.stringify(false));
    }
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error changing subscription to subreddit", {
      status: 500,
    });
  }
}
