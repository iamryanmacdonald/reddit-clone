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

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: {
        id,
      },
    });

    if (!comment)
      return new NextResponse("Comment does not exist", { status: 404 });

    // Pull inputs from the request
    const body = await req.json();
    const data = APIModelInputs["comments/[id]/vote:POST"].parse(body);

    const commentVote = await prisma.commentVote.upsert({
      create: {
        commentId: id,
        userId: session.user.id,
        vote: data.vote,
      },
      update: {
        vote: data.vote,
      },
      where: {
        commentId_userId: {
          commentId: id,
          userId: session.user.id,
        },
      },
    });

    // Get comment votes to return
    const votesAgg = await prisma.commentVote.aggregate({
      _sum: {
        vote: true,
      },
      where: {
        commentId: id,
      },
    });

    return new NextResponse(
      JSON.stringify({
        vote: commentVote.vote,
        votes: votesAgg._sum.vote ?? 0,
      }),
    );
  } catch (error) {
    if (error instanceof z.ZodError)
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });

    return new NextResponse("Error creating comment vote", { status: 500 });
  }
}
