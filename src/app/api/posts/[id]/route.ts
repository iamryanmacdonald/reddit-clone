import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { APIModelInputs } from "~/lib/api-models";
import { authOptions } from "~/lib/auth";
import { prisma } from "~/lib/db";

export async function PATCH(
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
    if (post.authorId !== session.user.id)
      return new NextResponse("Unauthorized", { status: 401 });

    // Pull inputs from the request
    const body = await req.json();
    const data = APIModelInputs["posts/[id]:PATCH"].parse(body);

    // Edit the post
    const updatedPost = await prisma.post.update({
      data,
      where: {
        id: post.id,
      },
    });

    return new NextResponse(JSON.stringify({ content: updatedPost.content }));
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error modifying post", { status: 500 });
  }
}
