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
    const data = APIModelInputs["posts/[id]/comments:POST"].parse(body);

    // Batch comment creation and upvote creation
    const comment = await prisma.$transaction(async (tx) => {
      // Create the comment
      const { id } = await tx.comment.create({
        data: {
          ...data,
          authorId: session.user.id,
        },
        include: {
          author: true,
          votes: true,
        },
      });
      // Create an upvote for the use to the comment
      await tx.commentVote.create({
        data: {
          commentId: id,
          userId: session.user.id,
          vote: 1,
        },
      });

      // Refetch the comment
      const comment = await tx.comment.findUnique({ where: { id } });

      return comment;
    });

    return new NextResponse(JSON.stringify({ comment }));
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error creating comment", { status: 500 });
  }
}
