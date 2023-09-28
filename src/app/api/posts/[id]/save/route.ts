import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { APIModelInputs } from "~/lib/api-models";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    // Make sure the user is authorized
    const session = await getServerSession(authOptions);

    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    // Pull id from the params
    const id = parseInt(params.id);

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    if (!post) return new NextResponse("Post does not exist", { status: 404 });

    // Pull inputs from the request
    const body = await req.json();
    const data = APIModelInputs["posts/[id]/save:POST"].parse(body);

    if (data.save) {
      await prisma.savedPost.upsert({
        create: {
          postId: post.id,
          userId: session.user.id,
        },
        update: {},
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      });
    } else {
      await prisma.savedPost.delete({
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      });
    }

    return new NextResponse(JSON.stringify({ saved: data.save }));
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error saving post", { status: 500 });
  }
}
